import { db } from "@/db";
import { handleApiError } from "@/lib/utils";
import { items, tripItems, tripReturnSchema, trips } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const parsedBody = tripReturnSchema.safeParse(body);

  if (!parsedBody.success) {
    return handleApiError(parsedBody.error, "Invalid trip return payload");
  }

  try {
    const trip = await db
      .select()
      .from(trips)
      .where(eq(trips.id, parsedBody.data.tripId))
      .limit(1);

    if (!trip[0]) {
      return Response.json({ message: "Trip not found" }, { status: 404 });
    }

    if (trip[0].status === "COMPLETED") {
      return Response.json(
        { message: "Trip is already completed" },
        { status: 409 },
      );
    }

    const tripItemRows = await db
      .select()
      .from(tripItems)
      .where(eq(tripItems.tripId, parsedBody.data.tripId));

    const tripItemByItemId = new Map(
      tripItemRows.map((row) => [row.itemId, row]),
    );

    for (const returnedItem of parsedBody.data.items) {
      const tripItem = tripItemByItemId.get(returnedItem.itemId);

      if (!tripItem) {
        return Response.json(
          { message: "Trip item not found" },
          { status: 404 },
        );
      }

      const remainingQuantity =
        tripItem.quantityTaken - tripItem.quantityReturned;

      if (returnedItem.quantityReturned > remainingQuantity) {
        return Response.json(
          { message: "Returned quantity cannot exceed remaining quantity." },
          { status: 400 },
        );
      }
    }

    await db.transaction(async (tx) => {
      for (const returnedItem of parsedBody.data.items) {
        const tripItem = tripItemByItemId.get(returnedItem.itemId);

        if (!tripItem) {
          throw new Error("Trip item not found");
        }

        const nextReturnedQuantity =
          tripItem.quantityReturned + returnedItem.quantityReturned;

        await tx
          .update(tripItems)
          .set({
            quantityReturned: nextReturnedQuantity,
          })
          .where(
            and(
              eq(tripItems.tripId, parsedBody.data.tripId),
              eq(tripItems.itemId, returnedItem.itemId),
            ),
          );

        await tx
          .update(items)
          .set({
            quantity: sql`${items.quantity} + ${returnedItem.quantityReturned}`,
            updatedAt: new Date(),
          })
          .where(eq(items.id, returnedItem.itemId));
      }

      await tx
        .update(trips)
        .set({
          status: "COMPLETED",
          returnedAt: parsedBody.data.returnedAt ?? new Date(),
        })
        .where(eq(trips.id, parsedBody.data.tripId));
    });

    const [completedTrip] = await db
      .select()
      .from(trips)
      .where(eq(trips.id, parsedBody.data.tripId))
      .limit(1);

    return Response.json(completedTrip);
  } catch (error) {
    console.error("FULL ERROR");
    console.dir(error, { depth: null });

    return handleApiError(error, "Error completing trip");
  }
}
