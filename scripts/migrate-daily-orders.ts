import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
  const { sql } = await import('../lib/db');

  // 1. Delete test orders 100 and 101 (and their order_items)
  const testOrders = await sql`SELECT id FROM orders WHERE number IN (100, 101)`;
  for (const o of testOrders) {
    await sql`DELETE FROM order_items WHERE order_id = ${o.id}`;
  }
  await sql`DELETE FROM orders WHERE number IN (100, 101)`;
  console.log(`Deleted ${testOrders.length} test order(s).`);

  // 2. Drop the old number column and its unique constraint
  await sql`ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_number_key`;
  await sql`ALTER TABLE orders DROP COLUMN IF EXISTS number`;

  // 3. Add business_date and daily_number
  await sql`ALTER TABLE orders ADD COLUMN business_date DATE NOT NULL`;
  await sql`ALTER TABLE orders ADD COLUMN daily_number INTEGER NOT NULL`;

  // 4. Unique constraint on (business_date, daily_number)
  await sql`ALTER TABLE orders ADD CONSTRAINT orders_business_date_daily_number_key UNIQUE (business_date, daily_number)`;

  // 5. Create daily_order_counters table for atomic counter
  await sql`
    CREATE TABLE IF NOT EXISTS daily_order_counters (
      business_date DATE PRIMARY KEY,
      counter INTEGER NOT NULL DEFAULT 0
    );
  `;

  console.log('Migration complete: orders table now uses business_date + daily_number.');
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
