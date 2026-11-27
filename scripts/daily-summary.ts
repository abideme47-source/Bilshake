import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
  const args = process.argv.slice(2);
  const givenDate = args[0];

  let businessDate: string;
  if (givenDate) {
    businessDate = givenDate;
  } else {
    businessDate = new Date().toLocaleString('en-CA', { timeZone: 'Africa/Addis_Ababa' }).split(', ')[0];
  }

  const { sql } = await import('../lib/db');

  const orders = await sql`
    SELECT daily_number, status, total, created_at
    FROM orders
    WHERE business_date = ${businessDate}
    ORDER BY daily_number
  `;

  const count = orders.length;
  const totalBirr = orders.reduce((sum, o) => sum + Number(o.total), 0);

  console.log(`Daily summary for ${businessDate}`);
  console.log(`Orders: ${count}`);
  console.log(`Total: ${totalBirr} birr`);
  console.log('');
  console.log('Orders:');
  for (const o of orders) {
    const d = new Date(o.created_at);
    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const num = o.daily_number ?? o.dailyNumber;
    console.log(`  #${String(num).padStart(3, '0')}  ${time}  ${Number(o.total)} birr  (${o.status})`);
  }
}

main().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});
