import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
  const args = process.argv.slice(2);
  const hasYesFlag = args.includes('--yes');

  if (!hasYesFlag) {
    console.error('Usage: npx tsx scripts/clear-test-orders.ts --yes');
    console.error('Refusing to run without --yes flag.');
    process.exit(1);
  }

  if (process.env.NODE_ENV === 'production') {
    console.error('Refusing to run in NODE_ENV=production.');
    process.exit(1);
  }

  const { sql } = await import('../lib/db');

  // Delete order_items first (foreign key), then orders, then counters
  await sql`DELETE FROM order_items`;
  await sql`DELETE FROM orders`;
  await sql`DELETE FROM daily_order_counters`;

  console.log('All test orders, order items, and daily counters deleted.');
}

main().catch((err) => {
  console.error('Failed to clear orders:', err);
  process.exit(1);
});
