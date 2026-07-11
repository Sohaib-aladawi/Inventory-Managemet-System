import { db } from "@/db";
import { handleApiError } from "@/lib/utils";
import { vehicles, trips } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
	try {
		const activeTrips = await db
			.select({
				id: trips.id,
				vehicleId: trips.vehicleId,
				status: trips.status,
				departedAt: trips.departedAt,
				returnedAt: trips.returnedAt,
				jobReference: trips.jobReference,
				notes: trips.notes,
				createdAt: trips.createdAt,
				vehicleRegistration: vehicles.registration,
				vehicleName: vehicles.name,
				vehicleType: vehicles.type,
			})
			.from(trips)
			.innerJoin(vehicles, eq(trips.vehicleId, vehicles.id))
			.where(eq(trips.status, "ACTIVE"))
			.orderBy(desc(trips.departedAt));

		return Response.json(activeTrips);
	} catch (error) {
		console.error("Error fetching active trips:", error);
		return handleApiError(error, "Error fetching active trips");
	}
}
