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
		const lowStockItems = allItems.filter((item) => item.quantity <= item.minimumStock).length;

		return Response.json({
			totalItems: allItems.length,
			totalVehicles: allVehicles.length,
			activeTrips: activeTrips.length,
			completedTrips: completedTrips.length,
			lowStockItems,
		});
	} catch (error) {
		console.error("Error fetching dashboard summary:", error);
		return handleApiError(error, "Error fetching dashboard summary");
	}
}
