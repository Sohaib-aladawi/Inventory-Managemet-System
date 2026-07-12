import "dotenv/config";
import { db } from "@/db";
import { items, vehicles,tripItems, trips } from "@/db/schema";

type Unit = "pcs" | "packs" | "kg" | "liters" | "boxes" | "piers" | "rolls";

const itemData: {
  sku: string;
  name: string;
  unit: Unit;
  quantity: number;
  minimumStock: number;
}[] = [
  { sku: "CAB001", name: "Ethernet Cable", unit: "pcs", quantity: 120, minimumStock: 20 },
  { sku: "CAB002", name: "Fiber Patch Cable", unit: "pcs", quantity: 90, minimumStock: 15 },
  { sku: "CON001", name: "RJ45 Connector", unit: "pcs", quantity: 300, minimumStock: 50 },
  { sku: "CON002", name: "Fiber Connector", unit: "pcs", quantity: 180, minimumStock: 30 },
  { sku: "TOOL001", name: "Crimping Tool", unit: "pcs", quantity: 12, minimumStock: 2 },
  { sku: "TOOL002", name: "Cable Tester", unit: "pcs", quantity: 10, minimumStock: 2 },
  { sku: "TOOL003", name: "Fusion Splicer", unit: "pcs", quantity: 4, minimumStock: 1 },
  { sku: "SAFE001", name: "Safety Helmet", unit: "pcs", quantity: 25, minimumStock: 5 },
  { sku: "SAFE002", name: "Safety Gloves", unit: "packs", quantity: 50, minimumStock: 10 },
  { sku: "SAFE003", name: "Safety Vest", unit: "pcs", quantity: 30, minimumStock: 5 },
  { sku: "MAT001", name: "Cable Ties", unit: "packs", quantity: 100, minimumStock: 20 },
  { sku: "MAT002", name: "Electrical Tape", unit: "pcs", quantity: 80, minimumStock: 10 },
  { sku: "MAT003", name: "Wall Clips", unit: "packs", quantity: 150, minimumStock: 20 },
  { sku: "MAT004", name: "PVC Conduit", unit: "pcs", quantity: 60, minimumStock: 10 },
  { sku: "MAT005", name: "Junction Box", unit: "pcs", quantity: 40, minimumStock: 10 },
  { sku: "NET001", name: "Network Switch", unit: "pcs", quantity: 15, minimumStock: 3 },
  { sku: "NET002", name: "WiFi Access Point", unit: "pcs", quantity: 20, minimumStock: 5 },
  { sku: "NET003", name: "SFP Module", unit: "pcs", quantity: 35, minimumStock: 5 },
  { sku: "NET004", name: "Patch Panel", unit: "pcs", quantity: 12, minimumStock: 2 },
  { sku: "NET005", name: "Rack Mount Kit", unit: "pcs", quantity: 18, minimumStock: 3 },
];


const vehicleData = [
  {
    registration: "MUS-1001",
    name: "Van 1",
    type: "Van",
  },
  {
    registration: "MUS-1002",
    name: "Van 2",
    type: "Van",
  },
  {
    registration: "MUS-1003",
    name: "Fiber Team Vehicle",
    type: "Van",
  },
  {
    registration: "MUS-2001",
    name: "Maintenance Pickup",
    type: "Pickup",
  },
  {
    registration: "MUS-3001",
    name: "Heavy Equipment Truck",
    type: "Truck",
  },
  {
    registration: "MUS-4001",
    name: "Emergency Response Vehicle",
    type: "SUV",
  },
];  




async function seed() {
  console.log("🌱 Seeding database...");

  // Clear old data
  await db.delete(tripItems);
  await db.delete(trips);
  await db.delete(items);
  await db.delete(vehicles);

  // Insert items
  await db.insert(items).values([...itemData]);

  // Insert vehicles
  await db.insert(vehicles).values([...vehicleData]);

  

  console.log("✅ Database seeded successfully");
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  });
