import { db } from "@/db";
import {
	items,
	tripItems,
	tripStartSchema,
	trips,
	vehicles,
} from "@/db/schema";
import { handleApiError } from "@/lib/utils";
import { and, eq, gte, inArray, sql } from "drizzle-orm";

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

		const [activeTrip] = await db
			.select({ id: trips.id })
			.from(trips)
			.where(
				and(eq(trips.vehicleId, parsedBody.data.vehicleId), eq(trips.status, "ACTIVE")),
			)
			.limit(1);

		if (activeTrip) {
			return Response.json(
				{ message: "Vehicle already has an active trip." },
				{ status: 409 },
			);
		}

		if (parsedBody.data.items.length > 0) {
			const itemIds = parsedBody.data.items.map((item) => item.itemId);
			const requestedItems = await db
				.select({ id: items.id, quantity: items.quantity })
				.from(items)
				.where(inArray(items.id, itemIds));

			if (requestedItems.length !== itemIds.length) {
				return Response.json({ message: "One or more items not found" }, { status: 404 });
			}

			const stockByItemId = new Map(requestedItems.map((item) => [item.id, item.quantity]));

			for (const requestedItem of parsedBody.data.items) {
				const availableQuantity = stockByItemId.get(requestedItem.itemId);

				if (availableQuantity === undefined || availableQuantity < requestedItem.quantityTaken) {
					return Response.json(
						{ message: "Stock is not available for one or more items." },
						{ status: 400 },
					);
				}
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

				for (const item of parsedBody.data.items) {
					const [updatedItem] = await tx
						.update(items)
						.set({
							quantity: sql`${items.quantity} - ${item.quantityTaken}`,
							updatedAt: new Date(),
						})
						.where(and(eq(items.id, item.itemId), gte(items.quantity, item.quantityTaken)))
						.returning({ id: items.id });

					if (!updatedItem) {
						throw new Error("Stock is not available for one or more items.");
					}
				}
			}

			return trip;
		});

		return Response.json(createdTrip, { status: 201 });
	} catch (error) {
		console.error("Error creating trip:", error);
		return handleApiError(error, "Error creating trip");
	}
}
