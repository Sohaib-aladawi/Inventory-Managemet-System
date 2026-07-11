import { db } from "@/db";
import { itemInsertSchema, items } from "@/db/schema";
import { handleApiError } from "@/lib/utils";

const newItemBodySchema = itemInsertSchema;

export async function GET() {
  try {
    const itemsData = await db.select().from(items);
    return Response.json(itemsData);
  } catch (error) {
    console.error("Error fetching items:", error);
    return handleApiError(error, "Error fetching items");
  }
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const parsedBody = newItemBodySchema.safeParse(body);

  if (!parsedBody.success) {
    return handleApiError(parsedBody.error, "Invalid item payload");
  }

  try {
    const [insertedItem] = await db
      .insert(items)
      .values({
        ...parsedBody.data,
      })
      .returning();

    return Response.json(insertedItem, { status: 201 });
  } catch (error) {
    console.error("Error creating item:", error);
    return handleApiError(error, "Error creating item");
  }
}
