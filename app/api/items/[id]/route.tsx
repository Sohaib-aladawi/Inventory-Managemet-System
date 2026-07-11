import { db } from "@/db";
import { itemUnitSchema, items } from "@/db/schema";
import { handleApiError } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { z } from "zod";

type RouteContext = {
  params: Promise<{ id: string }>;
};



const itemPatchSchema = z
  .object({
    sku: z.string().trim().min(1).max(100).optional(),
    name: z.string().trim().min(1).max(255).optional(),
    unit: itemUnitSchema.optional(),
    quantity: z.coerce.number().int().min(0).optional(),
    minimumStock: z.coerce.number().int().min(0).optional(),
  })
  .refine(
    (data) =>
      data.sku !== undefined ||
      data.name !== undefined ||
      data.unit !== undefined ||
      data.quantity !== undefined ||
      data.minimumStock !== undefined,
    {
      message: "No valid fields to update",
    },
  );

// ========GET API ========
export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const [item] = await db
      .select()
      .from(items)
      .where(eq(items.sku, id))
      .limit(1);

    if (!item) {
      return Response.json({ message: "Item not found" }, { status: 404 });
    }

    return Response.json(item);
  } catch (error) {
    console.error("Error fetching item:", error);
    return handleApiError(error, "Error fetching item");
  }
}

// ========PATCH API ========
export async function PATCH(request: Request, { params }: RouteContext) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const parsedBody = itemPatchSchema.safeParse(body);

  if (!parsedBody.success) {
    return handleApiError(parsedBody.error, "Invalid item update payload");
  }

  try {
    const { id } = await params;
    const [updatedItem] = await db
      .update(items)
      .set({
        ...parsedBody.data,
        updatedAt: new Date(),
      })
      .where(eq(items.sku, id))
      .returning();

    if (!updatedItem) {
      return Response.json({ message: "Item not found" }, { status: 404 });
    }

    return Response.json(updatedItem);
  } catch (error) {
    console.error("Error updating item:", error);
    return handleApiError(error, "Error updating item");
  }
}


// ========DELETE API ========
export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const [deletedItem] = await db
      .delete(items)
      .where(eq(items.sku, id))
      .returning();

    if (!deletedItem) {
      return Response.json({ message: "Item not found" }, { status: 404 });
    }

    return Response.json({ message: "Item deleted successfully" });
  } catch (error) {
    if (error instanceof Error && "code" in error && (error as { code?: string }).code === "23503") {
      return Response.json(
        { message: "Cannot delete item used in previous trips." },
        { status: 409 },
      );
    }

    console.error("Error deleting item:", error);
    return handleApiError(error, "Error deleting item");
  }
}
