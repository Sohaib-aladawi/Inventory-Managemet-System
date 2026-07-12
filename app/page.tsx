import { db } from "@/db";
import { items, trips, vehicles } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { StatTag } from "./components/StatTag";
import { LowStockList } from "./components/LowStockList";
import { ActiveFleetSnapshot } from "./components/ActiveFleetSnapshot";

export default async function DashboardPage() {
  const [allItems, allVehicles, activeTripRows] = await Promise.all([
    db.select().from(items),
    db.select().from(vehicles),
    db.select({
        id: trips.id,
        jobReference: trips.jobReference,
        vehicleRegistration: vehicles.registration,
        vehicleName: vehicles.name,
      })
      .from(trips)
      .innerJoin(vehicles, eq(trips.vehicleId, vehicles.id))
      .where(eq(trips.status, "ACTIVE"))
      .orderBy(desc(trips.departedAt)),
  ]);

  const lowStockItems = allItems
    .filter((item) => item.quantity <= item.minimumStock)
    .sort((a, b) => a.quantity - a.minimumStock - (b.quantity - b.minimumStock))
    .map((item) => ({
      sku: item.sku,
      name: item.name,
      quantity: item.quantity,
      minimumStock: item.minimumStock,
      unit: item.unit,
    }));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="page-title text-2xl">Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: "var(--steel)" }}>
          Current stock, fleet, and trip status at a glance.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatTag label="Items tracked" value={allItems.length} />
        <StatTag label="Vehicles" value={allVehicles.length} />
        <StatTag
          label="Active trips"
          value={activeTripRows.length}
          tone="teal"
        />
        <StatTag
          label="Low stock"
          value={lowStockItems.length}
          tone={lowStockItems.length > 0 ? "rust" : "default"}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <LowStockList items={lowStockItems} />
        <ActiveFleetSnapshot trips={activeTripRows} />
      </div>
    </div>
  );
}
