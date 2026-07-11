import {db} from "@/db";
import {vehicles} from "@/db/schema";
import {eq} from "drizzle-orm";
import {handleApiError} from "@/lib/utils";
import {z} from "zod";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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
export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const [vehicle] = await db
      .select()
      .from(vehicles)
      .where(eq(vehicles.id, id));  
    return Response.json(vehicle);
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    return handleApiError(error, "Error fetching vehicle");
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

  const parsedBody = vehiclePatchSchema.safeParse(body);

  if (!parsedBody.success) {
    return handleApiError(parsedBody.error, "Invalid vehicle payload");
  }

  try {
    const { id } = await params;
    const [updatedVehicle] = await db
      .update(vehicles)
      .set({
        ...parsedBody.data,
      })
      .where(eq(vehicles.id, id))
      .returning();

    if (!updatedVehicle) {
      return Response.json({ message: "Vehicle not found" }, { status: 404 });
    }

    return Response.json(updatedVehicle);
  } catch (error) {
    console.error("Error updating vehicle:", error);
    return handleApiError(error, "Error updating vehicle");
  }
}

// ========DELETE API ========
export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const deletedVehicle = await db.delete(vehicles).where(eq(vehicles.id, id));

    if (!deletedVehicle) {
      return Response.json({ message: "Vehicle not found" }, { status: 404 });
    }

    return Response.json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    return handleApiError(error, "Error deleting vehicle");
  }
}   