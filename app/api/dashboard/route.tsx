import { db } from "@/db";
import { handleApiError } from "@/lib/utils";
import { items, trips, vehicles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
	try {
		const [allItems, allVehicles, activeTrips, completedTrips] = await Promise.all([
			db.select().from(items),
			db.select().from(vehicles),
			db.select().from(trips).where(eq(trips.status, "ACTIVE")),
			db.select().from(trips).where(eq(trips.status, "COMPLETED")),
		]);

		return Response.json({
			itemsCount: allItems.length,
			vehiclesCount: allVehicles.length,
			activeTripsCount: activeTrips.length,
			completedTripsCount: completedTrips.length,
		});
	} catch (error) {
		console.error("Error fetching dashboard summary:", error);
		return handleApiError(error, "Error fetching dashboard summary");
	}
}
