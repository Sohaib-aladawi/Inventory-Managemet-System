import { db } from "@/db";
import { handleApiError } from "@/lib/utils";
import { tripItems, tripReturnSchema, trips } from "@/db/schema";
import { and, eq } from "drizzle-orm";

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
		const trip = await db.select().from(trips).where(eq(trips.id, parsedBody.data.tripId)).limit(1);

		if (!trip[0]) {
			return Response.json({ message: "Trip not found" }, { status: 404 });
		}

		if (trip[0].status === "COMPLETED") {
			return Response.json({ message: "Trip is already completed" }, { status: 400 });
		}

		const tripItemRows = await db
			.select()
			.from(tripItems)
			.where(eq(tripItems.tripId, parsedBody.data.tripId));

		const tripItemByItemId = new Map(tripItemRows.map((row) => [row.itemId, row]));

		for (const returnedItem of parsedBody.data.items) {
			const tripItem = tripItemByItemId.get(returnedItem.itemId);

			if (!tripItem) {
				return Response.json({ message: "Trip item not found" }, { status: 404 });
			}

			if (returnedItem.quantityReturned > tripItem.quantityTaken) {
				return Response.json(
					{ message: "Returned quantity cannot exceed quantity taken" },
					{ status: 400 },
				);
			}
		}

		await db.transaction(async (tx) => {
			for (const returnedItem of parsedBody.data.items) {
				await tx
					.update(tripItems)
					.set({
						quantityReturned: returnedItem.quantityReturned,
					})
					.where(
						and(
							eq(tripItems.tripId, parsedBody.data.tripId),
							eq(tripItems.itemId, returnedItem.itemId),
						),
					);
			}

			await tx
				.update(trips)
				.set({
					status: "COMPLETED",
					returnedAt: parsedBody.data.returnedAt ?? new Date(),
				})
				.where(eq(trips.id, parsedBody.data.tripId));
		});

		const [completedTrip] = await db.select().from(trips).where(eq(trips.id, parsedBody.data.tripId)).limit(1);

		return Response.json(completedTrip);
	} catch (error) {
		console.error("Error completing trip:", error);
		return handleApiError(error, "Error completing trip");
	}
}
