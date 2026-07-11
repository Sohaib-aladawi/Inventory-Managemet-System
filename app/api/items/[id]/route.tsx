import { db } from "@/db";
import { items } from "@/db/schema";
import { eq } from "drizzle-orm";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type ItemBody = {
  sku?: string;
  name?: string;
  unit?: string;
  quantity?: number;
  minimumStock?: number;
};

//   const resolved = await params         // unwrap the Promise
//   console.log('params', resolved)       // e.g. { id: 'CAB001' }
//   const { id } = resolved
//   return Response.json({ id })
// }// export async function GET(request: Request, { params }: { params: any }) {
// ========GET API ========
export async function GET(request: Request, { params }: RouteContext) {
  const { id } = await params
  const [item] = await db
    .select()
    .from(items)
    .where(eq(items.sku, id))
    .limit(1);

  if (!item) {
    return Response.json({ message: "Item not found" }, { status: 404 });
  }

  return Response.json(item);
}

// ========PATCH API ========
export async function PATCH(request: Request, { params }: RouteContext) {
  let body: ItemBody;

  try {
    body = (await request.json()) as ItemBody;
  } catch {
    return Response.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const updates: Partial<ItemBody> & { updatedAt: Date } = {
    updatedAt: new Date(),
  };

  if (typeof body.sku === "string") updates.sku = body.sku;
  if (typeof body.name === "string") updates.name = body.name;
  if (typeof body.unit === "string") updates.unit = body.unit;
  if (typeof body.quantity === "number") updates.quantity = body.quantity;
  if (typeof body.minimumStock === "number")
    updates.minimumStock = body.minimumStock;

  if (Object.keys(updates).length === 1) {
    return Response.json(
      { message: "No valid fields to update" },
      { status: 400 },
    );
  }
  const { id } = await params;
  const [updatedItem] = await db
    .update(items)
    .set(updates)
    .where(eq(items.sku, id))
    .returning();

  if (!updatedItem) {
    return Response.json({ message: "Item not found" }, { status: 404 });
  }

  return Response.json(updatedItem);
}


// ========DELETE API ========
export async function DELETE(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const [deletedItem] = await db.delete(items).where(eq(items.sku, id)).returning();

  if (!deletedItem) {
    return Response.json({ message: "Item not found" }, { status: 404 });
  }

  return Response.json({ message: "Item deleted successfully" });
}
