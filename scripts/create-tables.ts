import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
  const { sql } = await import('../lib/db');

  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name_en TEXT NOT NULL,
      name_am TEXT NOT NULL DEFAULT '',
      type TEXT NOT NULL CHECK (type IN ('food', 'drink'))
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS menu_items (
      id TEXT PRIMARY KEY,
      name_en TEXT NOT NULL,
      name_am TEXT NOT NULL DEFAULT '',
      type TEXT NOT NULL CHECK (type IN ('food', 'drink')),
      category_id TEXT NOT NULL REFERENCES categories(id),
      price INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      description_en TEXT NOT NULL DEFAULT '',
      ingredients TEXT[],
      fasting BOOLEAN NOT NULL DEFAULT false,
      available BOOLEAN NOT NULL DEFAULT true,
      sort_order INTEGER NOT NULL DEFAULT 0,
      suggested_drink_ids TEXT[]
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS menu_item_sizes (
      id SERIAL PRIMARY KEY,
      menu_item_id TEXT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
      label TEXT NOT NULL,
      price INTEGER NOT NULL
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS menu_item_add_ons (
      id SERIAL PRIMARY KEY,
      menu_item_id TEXT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
      label TEXT NOT NULL,
      price INTEGER NOT NULL
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      business_date DATE NOT NULL,
      daily_number INTEGER NOT NULL,
      tracking_token TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'cooking', 'ready')),
      total INTEGER NOT NULL,
      table_number TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT orders_business_date_daily_number_key UNIQUE (business_date, daily_number)
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS daily_order_counters (
      business_date DATE PRIMARY KEY,
      counter INTEGER NOT NULL DEFAULT 0
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      menu_item_id TEXT NOT NULL,
      name TEXT NOT NULL,
      name_en TEXT NOT NULL DEFAULT '',
      name_am TEXT NOT NULL DEFAULT '',
      size TEXT,
      add_ons TEXT[] NOT NULL DEFAULT '{}',
      note TEXT NOT NULL DEFAULT '',
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL,
  line_price INTEGER NOT NULL,
  image_url TEXT NOT NULL DEFAULT ''
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS rate_limits (
      ip TEXT PRIMARY KEY,
      count INTEGER NOT NULL DEFAULT 0,
      reset_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  console.log('All tables created successfully.');
}

main().catch((err) => {
  console.error('Failed to create tables:', err);
  process.exit(1);
});
