import {db} from "@/db";
import { items } from "@/db/schema";

export async function GET() {
    const data = await db.select().from(items);

    return Response.json(data);
}