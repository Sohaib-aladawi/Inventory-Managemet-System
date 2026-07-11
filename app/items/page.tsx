import { db } from "@/db";
import { items } from "@/db/schema";
import { ItemsExplorer } from "../components/ItemsExplorer";

export default async function ItemsPage() {
  const allItems = await db.select().from(items);

  const mapped = allItems.map((item) => ({
    sku: item.sku,
    name: item.name,
    unit: item.unit,
    quantity: item.quantity,
    minimumStock: item.minimumStock,
  }));

  return <ItemsExplorer initialItems={mapped} />;
}
