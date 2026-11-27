import { config } from 'dotenv';
config({ path: '.env.local' });
async function main() {
  const { sql } = await import('./lib/db');
  await sql`DELETE FROM order_items`;
  await sql`DELETE FROM orders`;
  await sql`DELETE FROM daily_order_counters`;
  console.log('Cleared all orders and counters.');
}
main();
