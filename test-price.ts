import { config } from 'dotenv';
config({ path: '.env.local' });
async function main() {
  const { sql } = await import('./lib/db');
  
  // Show current price
  const before = await sql`SELECT id, price FROM menu_items WHERE id = 'normal-beef-burger'`;
  console.log('Before price change:', JSON.stringify(before));
  
  // Change price to 999
  await sql`UPDATE menu_items SET price = 999 WHERE id = 'normal-beef-burger'`;
  
  const after = await sql`SELECT id, price FROM menu_items WHERE id = 'normal-beef-burger'`;
  console.log('After price change:', JSON.stringify(after));
  
  // Check old order #001 still has unit_price = 180
  const orderItems = await sql`SELECT unit_price, line_price, name FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE daily_number = 1)`;
  console.log('Order #001 items:', JSON.stringify(orderItems));
  
  // Change price back
  await sql`UPDATE menu_items SET price = 180 WHERE id = 'normal-beef-burger'`;
  
  const restored = await sql`SELECT id, price FROM menu_items WHERE id = 'normal-beef-burger'`;
  console.log('Price restored:', JSON.stringify(restored));
}
main();
