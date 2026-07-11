import { db } from "@/db";
import { vehicles } from "@/db/schema";
import { VehiclesExplorer } from "../components/VehiclesExplorer";

export default async function VehiclesPage() {
  const allVehicles = await db.select().from(vehicles);

  const mapped = allVehicles.map((vehicle) => ({
    id: vehicle.id,
    registration: vehicle.registration,
    name: vehicle.name,
    type: vehicle.type,
  }));

  return <VehiclesExplorer initialVehicles={mapped} />;
}
