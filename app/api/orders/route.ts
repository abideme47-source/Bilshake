import { sql } from '@/lib/db';
import { randomUUID } from 'crypto';

type OrderItemInput = {
  id: string;
  size: string | null;
  addOns: string[];
  note: string;
  quantity: number;
};

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

function getClientIP(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIP = headers.get('x-real-ip');
  if (realIP) return realIP;
  return 'unknown';
}

async function checkRateLimit(ip: string): Promise<boolean> {
  // Delete expired rows so the table does not grow forever
  await sql`DELETE FROM rate_limits WHERE reset_at < NOW()`

  const result = await sql`
    INSERT INTO rate_limits (ip, count, reset_at)
    VALUES (${ip}, 1, NOW() + INTERVAL '1 minute')
    ON CONFLICT (ip) DO UPDATE
      SET count = CASE
          WHEN rate_limits.reset_at < NOW() THEN 1
          ELSE rate_limits.count + 1
      END,
      reset_at = CASE
          WHEN rate_limits.reset_at < NOW() THEN NOW() + INTERVAL '1 minute'
          ELSE rate_limits.reset_at
      END
    RETURNING count, reset_at;
  `;

  const row = result[0];
  return Number(row.count) <= RATE_LIMIT_MAX;
}

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const ip = getClientIP(req.headers);
  if (!(await checkRateLimit(ip))) {
    return Response.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  let body: { items: OrderItemInput[]; tableNumber?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { items, tableNumber } = body;

  if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
    return Response.json({ error: 'Order must contain between 1 and 50 items.' }, { status: 400 });
  }

  // Validate each item
  for (const item of items) {
    if (!item.id || typeof item.id !== 'string') {
      return Response.json({ error: 'Each item must have a valid id.' }, { status: 400 });
    }
    if (item.size !== null && typeof item.size !== 'string') {
      return Response.json({ error: 'Each item must have a valid size (string or null).' }, { status: 400 });
    }
    if (!Array.isArray(item.addOns) || !item.addOns.every((a) => typeof a === 'string')) {
      return Response.json({ error: 'Each item must have a valid addOns array of strings.' }, { status: 400 });
    }
    if (typeof item.note !== 'string') {
      return Response.json({ error: 'Each item must have a valid note string.' }, { status: 400 });
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20) {
      return Response.json({ error: 'Each item must have a quantity between 1 and 20.' }, { status: 400 });
    }
  }

  // Fetch menu items from DB (only available ones) to recalculate prices server-side
  const itemIds = items.map((i) => i.id);
  const dbItems = await sql`
    SELECT id, name_en AS "nameEn", name_am AS "nameAm", price, image_url AS "imageUrl"
    FROM menu_items
    WHERE id = ANY(${itemIds}) AND available = true
  `;

  const dbItemMap = new Map<string, { id: string; nameEn: string; nameAm: string; price: number; imageUrl: string }>();
  for (const it of dbItems) {
    dbItemMap.set(it.id, it);
  }

  // Reject unknown or unavailable item ids
  for (const item of items) {
    if (!dbItemMap.has(item.id)) {
      return Response.json({ error: `Item ${item.id} not found or unavailable.` }, { status: 400 });
    }
  }

  // Fetch sizes and add-ons for validation and price calculation
  const dbSizes = await sql`
    SELECT menu_item_id AS "menuItemId", label, price FROM menu_item_sizes
    WHERE menu_item_id = ANY(${itemIds})
  `;
  const dbAddOns = await sql`
    SELECT menu_item_id AS "menuItemId", label, price FROM menu_item_add_ons
    WHERE menu_item_id = ANY(${itemIds})
  `;

  const sizeMap = new Map<string, Map<string, number>>();
  for (const s of dbSizes) {
    let m = sizeMap.get(s.menuItemId);
    if (!m) { m = new Map(); sizeMap.set(s.menuItemId, m); }
    m.set(s.label, Number(s.price));
  }

  const addOnMap = new Map<string, Map<string, number>>();
  for (const a of dbAddOns) {
    let m = addOnMap.get(a.menuItemId);
    if (!m) { m = new Map(); addOnMap.set(a.menuItemId, m); }
    m.set(a.label, Number(a.price));
  }

  // Calculate total server-side (never trust browser prices)
  let grandTotal = 0;
  const orderedItems: Array<{
    menuItemId: string;
    name: string;
    nameEn: string;
    nameAm: string;
    size: string | null;
    addOns: string[];
    note: string;
    quantity: number;
    linePrice: number;
    unitPrice: number;
    imageUrl: string;
  }> = [];

  for (const input of items) {
    const dbItem = dbItemMap.get(input.id)!;
    const unitPrice = input.size
      ? sizeMap.get(input.id)?.get(input.size) ?? dbItem.price
      : dbItem.price;
    const addOnPrice = input.addOns.reduce((sum, label) => sum + (addOnMap.get(input.id)?.get(label) ?? 0), 0);
    const totalUnitPrice = unitPrice + addOnPrice;
    const linePrice = totalUnitPrice * input.quantity;
    grandTotal += linePrice;

    orderedItems.push({
      menuItemId: input.id,
      name: dbItem.nameEn,
      nameEn: dbItem.nameEn,
      nameAm: dbItem.nameAm,
      size: input.size,
      addOns: input.addOns,
      note: input.note,
      quantity: input.quantity,
      linePrice,
      unitPrice: totalUnitPrice,
      imageUrl: dbItem.imageUrl,
    });
  }

  // Compute business date in Ethiopia time zone (same as counter)
  const businessDate = new Date().toLocaleString('en-CA', { timeZone: 'Africa/Addis_Ababa' }).split(', ')[0];

  const orderId = randomUUID();
  const trackingToken = randomUUID();

  // One atomic transaction: counter + order + order_items.
  // If any part fails, everything rolls back and the number is not used.
  const results = await sql.transaction(tx => [
    tx`
      WITH new_counter AS (
        INSERT INTO daily_order_counters (business_date, counter)
        VALUES ((now() AT TIME ZONE 'Africa/Addis_Ababa')::date, 1)
        ON CONFLICT (business_date) DO UPDATE
          SET counter = daily_order_counters.counter + 1
        RETURNING counter
      ),
      new_order AS (
        INSERT INTO orders (id, business_date, daily_number, tracking_token, status, total, table_number)
        SELECT ${orderId}, ${businessDate}, new_counter.counter, ${trackingToken}, 'pending', ${grandTotal}, ${tableNumber ?? null}
        FROM new_counter
        RETURNING id, daily_number
      )
      SELECT daily_number FROM new_order
    `,
    ...orderedItems.map(oi =>
      tx`INSERT INTO order_items (order_id, menu_item_id, name, name_en, name_am, size, add_ons, note, quantity, line_price, image_url, unit_price)
        VALUES (${orderId}, ${oi.menuItemId}, ${oi.name}, ${oi.nameEn}, ${oi.nameAm}, ${oi.size}, ${oi.addOns}, ${oi.note}, ${oi.quantity}, ${oi.linePrice}, ${oi.imageUrl}, ${oi.unitPrice})`
    )
  ]);
  const dailyNumber = Number(results[0][0].daily_number);

  return Response.json({
    number: dailyNumber,
    trackingToken,
  });
}
