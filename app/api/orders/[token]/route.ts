import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const order = await sql`
    SELECT id, daily_number AS "dailyNumber", business_date AS "businessDate", status, total, created_at
    FROM orders
    WHERE tracking_token = ${token}
  `;

  if (order.length === 0) {
    return Response.json({ error: 'Order not found.' }, { status: 404 });
  }

  const orderItems = await sql`
    SELECT name, name_en AS "nameEn", name_am AS "nameAm", size, add_ons AS "addOns", note, quantity, line_price AS "linePrice", image_url AS "imageUrl"
    FROM order_items
    WHERE order_id = ${order[0].id}
  `;

  return Response.json({
    number: Number(order[0].dailyNumber),
    businessDate: order[0].businessDate,
    status: order[0].status,
    total: Number(order[0].total),
    items: orderItems.map((it) => ({
      name: it.name,
      nameEn: it.nameEn,
      nameAm: it.nameAm,
      size: it.size,
      addOns: it.addOns,
      note: it.note,
      quantity: Number(it.quantity),
      linePrice: Number(it.linePrice),
      imageUrl: it.imageUrl,
    })),
  });
}
