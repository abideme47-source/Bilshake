import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { requireAdmin } from "@/lib/auth/admin";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const a = await requireAdmin();
  if (!a.ok) return NextResponse.json({ error: "Forbidden" }, { status: a.status });
  const rows = await sql`SELECT o.*, (SELECT json_agg(oi) FROM order_items oi WHERE oi.order_id=o.id) AS items FROM orders o WHERE o.business_date = (now() AT TIME ZONE 'Africa/Addis_Ababa')::date ORDER BY (o.status='ready'), o.created_at ASC`;
  return NextResponse.json(rows);
}

type OrderItemInput = { id: string; size: string | null; addOns: string[]; note: string; quantity: number };

export async function POST(req: Request) {
  const a = await requireAdmin();
  if (!a.ok) return NextResponse.json({ error: "Forbidden" }, { status: a.status });

  let body: { items: OrderItemInput[]; phone: string; location: string; notes?: string; total: number };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { items, phone, location, notes, total } = body;
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) return NextResponse.json({ error: "Bad items" }, { status: 400 });
  if (typeof phone !== "string" || !phone.trim()) return NextResponse.json({ error: "Phone required" }, { status: 400 });
  if (typeof location !== "string" || !location.trim()) return NextResponse.json({ error: "Location required" }, { status: 400 });
  if (!Number.isInteger(total) || total < 0) return NextResponse.json({ error: "Total must be whole number >=0" }, { status: 400 });

  const itemIds = items.map((i) => i.id);
  const dbItems = await sql`SELECT id, name_en AS "nameEn", name_am AS "nameAm", price, image_url AS "imageUrl" FROM menu_items WHERE id = ANY(${itemIds}) AND available = true`;
  const dbItemMap = new Map(dbItems.map((it: any) => [it.id, it]));
  for (const item of items) {
    if (!dbItemMap.has(item.id)) return NextResponse.json({ error: `Item ${item.id} not found or unavailable.` }, { status: 400 });
  }

  const dbSizes = await sql`SELECT menu_item_id AS "menuItemId", label, price FROM menu_item_sizes WHERE menu_item_id = ANY(${itemIds})`;
  const dbAddOns = await sql`SELECT menu_item_id AS "menuItemId", label, price FROM menu_item_add_ons WHERE menu_item_id = ANY(${itemIds})`;
  const sizeMap = new Map<string, Map<string, number>>();
  for (const s of dbSizes as any[]) { let m = sizeMap.get(s.menuItemId); if (!m) { m = new Map(); sizeMap.set(s.menuItemId, m); } m.set(s.label, Number(s.price)); }
  const addOnMap = new Map<string, Map<string, number>>();
  for (const a of dbAddOns as any[]) { let m = addOnMap.get(a.menuItemId); if (!m) { m = new Map(); addOnMap.set(a.menuItemId, m); } m.set(a.label, Number(a.price)); }

  let grandTotal = 0;
  const orderedItems: any[] = [];
  for (const input of items) {
    const dbItem = dbItemMap.get(input.id)!;
    const unitPrice = input.size ? (sizeMap.get(input.id)?.get(input.size) ?? dbItem.price) : dbItem.price;
    const addOnPrice = input.addOns.reduce((sum, label) => sum + (addOnMap.get(input.id)?.get(label) ?? 0), 0);
    const totalUnitPrice = unitPrice + addOnPrice;
    const linePrice = totalUnitPrice * input.quantity;
    grandTotal += linePrice;
    orderedItems.push({ menuItemId: input.id, name: dbItem.nameEn, nameEn: dbItem.nameEn, nameAm: dbItem.nameAm, size: input.size, addOns: input.addOns, note: input.note, quantity: input.quantity, linePrice, unitPrice: totalUnitPrice, imageUrl: dbItem.imageUrl });
  }

  const businessDate = new Date().toLocaleString("en-CA", { timeZone: "Africa/Addis_Ababa" }).split(", ")[0];
  const orderId = randomUUID();
  const trackingToken = randomUUID();

  const results = await sql.transaction((tx) => [
    tx`
      WITH new_counter AS (
        INSERT INTO daily_order_counters (business_date, counter)
        VALUES ((now() AT TIME ZONE 'Africa/Addis_Ababa')::date, 1)
        ON CONFLICT (business_date) DO UPDATE SET counter = daily_order_counters.counter + 1
        RETURNING counter
      ),
      new_order AS (
        INSERT INTO orders (id, business_date, daily_number, tracking_token, status, total, items_total, channel, delivery_phone, delivery_location, notes, paid)
        SELECT ${orderId}, ${businessDate}, new_counter.counter, ${trackingToken}, 'pending', ${total}, ${grandTotal}, 'delivery', ${phone}, ${location}, ${notes ?? null}, false
        FROM new_counter
        RETURNING id, daily_number
      )
      SELECT daily_number FROM new_order
    `,
    ...orderedItems.map((oi) =>
      tx`INSERT INTO order_items (order_id, menu_item_id, name, name_en, name_am, size, add_ons, note, quantity, line_price, image_url, unit_price)
        VALUES (${orderId}, ${oi.menuItemId}, ${oi.name}, ${oi.nameEn}, ${oi.nameAm}, ${oi.size}, ${oi.addOns}, ${oi.note}, ${oi.quantity}, ${oi.linePrice}, ${oi.imageUrl}, ${oi.unitPrice})`
    ),
  ]);
  const dailyNumber = Number((results[0] as any)[0].daily_number);

  return NextResponse.json({ number: dailyNumber, trackingToken, itemsTotal: grandTotal, total });
}
