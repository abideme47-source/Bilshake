import { config } from 'dotenv';
config({ path: '.env.local' });
async function main() {
  const { sql } = await import('./lib/db');
  const prices = await sql`SELECT DISTINCT price FROM menu_items ORDER BY price`;
  console.log('All distinct prices:');
  for (const p of prices) {
    console.log('  ' + p.price);
  }
}
main();
