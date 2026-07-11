import {db} from "@/db";
import { vehicleInsertSchema, vehicles } from "@/db/schema";
import {handleApiError} from "@/lib/utils";
import {z} from "zod";

const newVehicleBodySchema = vehicleInsertSchema;


const vehiclePatchSchema = z
  .object({
    registration: z.string().trim().min(1).max(100).optional(),
    name: z.string().trim().min(1).max(255).optional(),
    type: z.string().trim().min(1).max(100).optional(),
  })
  .refine(
    (data) =>
      data.registration !== undefined ||
      data.name !== undefined ||
      data.type !== undefined,
    {
      message: "No valid fields to update",
    },
  );

  // ========GET API ========
export async function GET(request: Request) {
  try {
    const vehiclesData = await db.select().from(vehicles);
    return Response.json(vehiclesData);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return handleApiError(error, "Error fetching vehicles");
  }
}

// ========POST API ========
export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const parsedBody = newVehicleBodySchema.safeParse(body);

  if (!parsedBody.success) {
    return handleApiError(parsedBody.error, "Invalid vehicle payload");
  }

  try {
    const [insertedVehicle] = await db
      .insert(vehicles)
      .values({
        ...parsedBody.data,
      })
      .returning();

    return Response.json(insertedVehicle, { status: 201 });
  } catch (error) {
    console.error("Error creating vehicle:", error);
    return handleApiError(error, "Error creating vehicle");
  }
}