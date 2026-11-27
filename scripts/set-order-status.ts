import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
  const args = process.argv.slice(2);
  const businessDate = args[0];
  const dailyNumber = args[1];
  const status = args[2];

  if (!businessDate || !dailyNumber || !status) {
    console.error('Usage: npx tsx scripts/set-order-status.ts <business-date> <daily-number> <status>');
    console.error('Example: npx tsx scripts/set-order-status.ts 2026-11-25 1 cooking');
    process.exit(1);
  }

  const validStatuses = ['pending', 'cooking', 'ready'];
  if (!validStatuses.includes(status)) {
    console.error(`Invalid status '${status}'. Must be one of: ${validStatuses.join(', ')}`);
    process.exit(1);
  }

  const { sql } = await import('../lib/db');

  const result = await sql`
    UPDATE orders
    SET status = ${status}
    WHERE business_date = ${businessDate} AND daily_number = ${Number(dailyNumber)}
    RETURNING id, business_date, daily_number, status, tracking_token
  `;

  if (result.length === 0) {
    console.error(`No order found for business_date=${businessDate}, daily_number=${dailyNumber}`);
    process.exit(1);
  }

  console.log(`Updated order: business_date=${result[0].business_date}, daily_number=${result[0].daily_number}, status=${result[0].status}, token=${result[0].tracking_token}`);
}

main().catch((err) => {
  console.error('Failed to update order status:', err);
  process.exit(1);
});
