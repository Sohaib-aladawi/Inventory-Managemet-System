import { db } from "@/db";
import { items } from "@/db/schema";

type NewItemBody = {
  sku: string;
  name: string;
  unit: string;
  quantity?: number;
  minimumStock?: number;
};

export async function GET() {
  try {
    const itemsData = await db.select().from(items);
    return Response.json(itemsData);
  } catch (error) {
    console.error("Error fetching items:", error);
    return Response.json({ message: "Error fetching items" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: NewItemBody;

  try {
    body = (await request.json()) as NewItemBody;
  } catch {
    return Response.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.sku || !body.name || !body.unit) {
    return Response.json(
      { message: "sku, name, and unit are required" },
      { status: 400 },
    );
  }

  try {
    const [insertedItem] = await db
      .insert(items)
      .values({
        sku: body.sku,
        name: body.name,
        unit: body.unit,
        quantity: body.quantity ?? 0,
        minimumStock: body.minimumStock ?? 0,
      })
      .returning();

    return Response.json(insertedItem, { status: 201 });
  } catch (error) {
    console.error("Error creating item:", error);
    return Response.json({ message: "Error creating item" }, { status: 500 });
  }
}
