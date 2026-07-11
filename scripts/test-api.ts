import "dotenv/config";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

type RouteModule = Record<string, unknown>;
type TestResult = {
  route: string;
  method: string;
  status: number | null;
  ok: boolean;
  error?: string;
};

type RouteFile = {
  filePath: string;
  routeTemplate: string;
  routePath: string;
  params: Record<string, string>;
};

const apiRoot = path.join(process.cwd(), "app", "api");
const methodNames = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"] as const;
const fullMode = process.argv.includes("--full");

const uuidForIds = "00000000-0000-0000-0000-000000000001";

function isRouteFile(name: string) {
  return name === "route.ts" || name === "route.tsx";
}

function getSampleValue(paramName: string) {
  const lowerName = paramName.toLowerCase();

  if (lowerName.includes("id") || lowerName.includes("uuid")) {
    return uuidForIds;
  }

  if (lowerName.includes("sku")) {
    return "TEST-SKU-001";
  }

  if (lowerName.includes("registration")) {
    return "TEST-REG-001";
  }

  return "sample";
}

async function collectRouteFiles(dirPath: string): Promise<RouteFile[]> {
  const entries = await readdir(dirPath, { withFileTypes: true });
  const routeFiles: RouteFile[] = [];

  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      routeFiles.push(...(await collectRouteFiles(entryPath)));
      continue;
    }

    if (!entry.isFile() || !isRouteFile(entry.name)) {
      continue;
    }

    const routeDir = path.dirname(entryPath);
    const relativeDir = path.relative(apiRoot, routeDir);
    const templateSegments = relativeDir === "" ? [] : relativeDir.split(path.sep);
    const params: Record<string, string> = {};
    const concreteSegments = templateSegments.map((segment) => {
      if (segment.startsWith("[") && segment.endsWith("]")) {
        const paramName = segment.slice(1, -1).replace(/^\.\.\./, "");
        const sampleValue = getSampleValue(paramName);
        params[paramName] = sampleValue;
        return sampleValue;
      }

      return segment;
    });

    routeFiles.push({
      filePath: entryPath,
      routeTemplate: `/api/${templateSegments.join("/")}`,
      routePath: `/api/${concreteSegments.join("/")}`,
      params,
    });
  }

  return routeFiles.sort((left, right) => left.routeTemplate.localeCompare(right.routeTemplate));
}

function buildRequestBody(routeTemplate: string, method: string) {
  if (!fullMode) {
    return undefined;
  }

  if (routeTemplate === "/api/items" && method === "POST") {
    return {
      sku: "TEST-SKU-001",
      name: "Smoke Test Item",
      unit: "pcs",
      quantity: 1,
      minimumStock: 0,
    };
  }

  if (routeTemplate === "/api/items/[id]" && method === "PATCH") {
    return {
      name: "Updated Smoke Test Item",
    };
  }

  return undefined;
}

function formatRouteLabel(route: RouteFile) {
  return route.routeTemplate === route.routePath
    ? route.routeTemplate
    : `${route.routeTemplate} -> ${route.routePath}`;
}

async function run() {
  const routeFiles = await collectRouteFiles(apiRoot);
  const results: TestResult[] = [];
  let routeCount = 0;
  let methodCount = 0;

  for (const routeFile of routeFiles) {
    const moduleUrl = pathToFileURL(routeFile.filePath).href;
    let routeModule: RouteModule;

    try {
      routeModule = (await import(moduleUrl)) as RouteModule;
    } catch (error) {
      results.push({
        route: routeFile.routeTemplate,
        method: "IMPORT",
        status: null,
        ok: false,
        error: error instanceof Error ? error.message : "Failed to import route module",
      });
      continue;
    }

    const exportedMethods = methodNames.filter(
      (method) => typeof routeModule[method] === "function",
    );

    if (exportedMethods.length === 0) {
      results.push({
        route: routeFile.routeTemplate,
        method: "NONE",
        status: null,
        ok: true,
      });
      continue;
    }

    routeCount += 1;

    for (const method of exportedMethods) {
      const handler = routeModule[method] as (
        request: Request,
        context?: { params: Promise<Record<string, string>> },
      ) => Promise<Response> | Response;
      const requestUrl = new URL(`http://localhost${routeFile.routePath}`);
      const requestInit: RequestInit = { method };
      const requestBody = buildRequestBody(routeFile.routeTemplate, method);

      if (requestBody !== undefined && method !== "GET" && method !== "HEAD") {
        requestInit.headers = {
          "content-type": "application/json",
        };
        requestInit.body = JSON.stringify(requestBody);
      }

      const request = new Request(requestUrl, requestInit);

      try {
        const response = await handler(request, {
          params: Promise.resolve(routeFile.params),
        });

        const status = response.status;
        const ok = status < 500;

        results.push({
          route: routeFile.routeTemplate,
          method,
          status,
          ok,
          error: ok ? undefined : `Unexpected ${status} response`,
        });
        methodCount += 1;
      } catch (error) {
        results.push({
          route: routeFile.routeTemplate,
          method,
          status: null,
          ok: false,
          error: error instanceof Error ? error.message : "Route handler threw",
        });
      }
    }
  }

  const failures = results.filter((result) => !result.ok);
  const summary = {
    routesDiscovered: routeFiles.length,
    routesExecuted: routeCount,
    methodsExecuted: methodCount,
    failures: failures.length,
    fullMode,
  };

  console.log(JSON.stringify(summary, null, 2));

  for (const result of results) {
    const label = `${result.method.padEnd(7)} ${formatRouteLabel(
      routeFiles.find((route) => route.routeTemplate === result.route) ?? {
        routeTemplate: result.route,
        routePath: result.route,
        filePath: "",
        params: {},
      },
    )}`;

    if (result.ok) {
      console.log(`PASS  ${label} ${result.status === null ? "" : `(${result.status})`}`.trim());
      continue;
    }

    console.log(
      `FAIL  ${label} ${result.status === null ? "" : `(${result.status})`} ${result.error ?? ""}`.trim(),
    );
  }

  if (failures.length > 0) {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
