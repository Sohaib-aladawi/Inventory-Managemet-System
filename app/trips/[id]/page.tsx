import { db } from "@/db";
import { items, tripItems, trips, vehicles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { TripDetail } from "../components/TripDetail";

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [trip] = await db.select().from(trips).where(eq(trips.id, id)).limit(1);

  if (!trip) {
    notFound();
  }

  const [vehicle] = await db
    .select()
    .from(vehicles)
    .where(eq(vehicles.id, trip.vehicleId))
    .limit(1);

  const tripItemRows = await db
    .select({
      itemId: tripItems.itemId,
      quantityTaken: tripItems.quantityTaken,
      quantityReturned: tripItems.quantityReturned,
      sku: items.sku,
      name: items.name,
      unit: items.unit,
    })
    .from(tripItems)
    .innerJoin(items, eq(tripItems.itemId, items.id))
    .where(eq(tripItems.tripId, id));

  return (
    <TripDetail
      trip={{
        id: trip.id,
        status: trip.status,
        departedAt: trip.departedAt.toISOString(),
        returnedAt: trip.returnedAt ? trip.returnedAt.toISOString() : null,
        jobReference: trip.jobReference,
        notes: trip.notes,
      }}
      vehicle={vehicle ? { registration: vehicle.registration, name: vehicle.name } : null}
      items={tripItemRows}
    />
  );
}
