import { db } from "@/db";
import { trips, vehicles } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { TripsExplorer } from "./components/TripsExplorer";

export default async function TripsPage() {
  const tripRows = await db
    .select({
      id: trips.id,
      vehicleId: trips.vehicleId,
      status: trips.status,
      departedAt: trips.departedAt,
      returnedAt: trips.returnedAt,
      jobReference: trips.jobReference,
      notes: trips.notes,
      vehicleRegistration: vehicles.registration,
      vehicleName: vehicles.name,
    })
    .from(trips)
    .innerJoin(vehicles, eq(trips.vehicleId, vehicles.id))
    .orderBy(desc(trips.departedAt));

  const mapped = tripRows.map((trip) => ({
    ...trip,
    departedAt: trip.departedAt.toISOString(),
    returnedAt: trip.returnedAt ? trip.returnedAt.toISOString() : null,
  }));

  return <TripsExplorer initialTrips={mapped} />;
}
