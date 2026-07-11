import { db } from "@/db";
import { handleApiError } from "@/lib/utils";
import { trips, vehicles } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
	try {
		const tripRows = await db
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
			.orderBy(desc(trips.departedAt));

		return Response.json(tripRows);
	} catch (error) {
		console.error("Error fetching trips:", error);
		return handleApiError(error, "Error fetching trips");
	}
}
