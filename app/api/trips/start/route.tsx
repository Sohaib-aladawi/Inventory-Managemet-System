import { db } from "@/db";
import {
	items,
	tripItems,
	tripStartSchema,
	trips,
	vehicles,
} from "@/db/schema";
import { handleApiError } from "@/lib/utils";
import { eq, inArray } from "drizzle-orm";

export async function POST(request: Request) {
	let body: unknown;

	try {
		body = await request.json();
	} catch {
		return Response.json({ message: "Invalid JSON body" }, { status: 400 });
	}

	const parsedBody = tripStartSchema.safeParse(body);

	if (!parsedBody.success) {
		return handleApiError(parsedBody.error, "Invalid trip start payload");
	}

	try {
		const [vehicle] = await db
			.select()
			.from(vehicles)
			.where(eq(vehicles.id, parsedBody.data.vehicleId))
			.limit(1);

		if (!vehicle) {
			return Response.json({ message: "Vehicle not found" }, { status: 404 });
		}

		if (parsedBody.data.items.length > 0) {
			const itemIds = parsedBody.data.items.map((item) => item.itemId);
			const existingItems = await db
				.select({ id: items.id })
				.from(items)
				.where(inArray(items.id, itemIds));

			if (existingItems.length !== itemIds.length) {
				return Response.json({ message: "One or more items not found" }, { status: 404 });
			}
		}

		const createdTrip = await db.transaction(async (tx) => {
			const [trip] = await tx
				.insert(trips)
				.values({
					vehicleId: parsedBody.data.vehicleId,
					jobReference: parsedBody.data.jobReference,
					notes: parsedBody.data.notes,
					status: "ACTIVE",
				})
				.returning();

			if (parsedBody.data.items.length > 0) {
				await tx.insert(tripItems).values(
					parsedBody.data.items.map((item) => ({
						tripId: trip.id,
						itemId: item.itemId,
						quantityTaken: item.quantityTaken,
					})),
				);
			}

			return trip;
		});

		return Response.json(createdTrip, { status: 201 });
	} catch (error) {
		console.error("Error creating trip:", error);
		return handleApiError(error, "Error creating trip");
	}
}
