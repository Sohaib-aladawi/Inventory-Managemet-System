import { db } from "@/db";
import { handleApiError } from "@/lib/utils";
import { items, tripItems, trips, vehicles } from "@/db/schema";
import { eq } from "drizzle-orm";

type RouteContext = {
	params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
	try {
		const { id } = await params;

		const [trip] = await db.select().from(trips).where(eq(trips.id, id)).limit(1);

		if (!trip) {
			return Response.json({ message: "Trip not found" }, { status: 404 });
		}

		const [vehicle] = await db
			.select()
			.from(vehicles)
			.where(eq(vehicles.id, trip.vehicleId))
			.limit(1);

		const tripItemRows = await db
			.select({
				id: tripItems.id,
				itemId: tripItems.itemId,
				quantityTaken: tripItems.quantityTaken,
				quantityReturned: tripItems.quantityReturned,
				createdAt: tripItems.createdAt,
				sku: items.sku,
				name: items.name,
				unit: items.unit,
			})
			.from(tripItems)
			.innerJoin(items, eq(tripItems.itemId, items.id))
			.where(eq(tripItems.tripId, id));

		return Response.json({
			...trip,
			vehicle,
			items: tripItemRows,
		});
	} catch (error) {
		console.error("Error fetching trip:", error);
		return handleApiError(error, "Error fetching trip");
	}
}
