import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
  const { sql } = await import('../lib/db');

  // Safety: refuse to run if menu_items already has rows (would overwrite admin edits)
  const existing = await sql`SELECT COUNT(*) AS count FROM menu_items`;
  if (Number(existing[0].count) > 0) {
    console.error('Aborting seed: menu_items already has rows. Run seed only on an empty database.');
    process.exit(1);
  }

  // Insert categories
  const { categories } = await import('../data/categories');
  const { menuItems } = await import('../data/menu');

  for (let i = 0; i < categories.length; i++) {
    const c = categories[i];
    await sql`
      INSERT INTO categories (id, name_en, name_am, type)
      VALUES (${c.id}, ${c.nameEn}, ${c.nameAm}, ${c.type})
      ON CONFLICT (id) DO NOTHING;
    `;
  }
  console.log(`Seeded ${categories.length} categories.`);

  // Insert menu items with sizes and add-ons
  for (let i = 0; i < menuItems.length; i++) {
    const item = menuItems[i];
    await sql`
      INSERT INTO menu_items (id, name_en, name_am, type, category_id, price, image_url, description_en, ingredients, fasting, available, sort_order, suggested_drink_ids)
      VALUES (${item.id}, ${item.nameEn}, ${item.nameAm}, ${item.type}, ${item.categoryId}, ${item.price}, ${item.imageUrl}, ${item.descriptionEn}, ${item.ingredients ?? []}, ${item.fasting}, ${item.available}, ${i}, ${item.suggestedDrinkIds ?? []})
      ON CONFLICT (id) DO NOTHING;
    `;

    // Insert sizes
    if (item.sizes?.length) {
      for (const size of item.sizes) {
        await sql`
          INSERT INTO menu_item_sizes (menu_item_id, label, price)
          VALUES (${item.id}, ${size.label}, ${size.price})
          ON CONFLICT DO NOTHING;
        `;
      }
    }

    // Insert add-ons
    if (item.addOns?.length) {
      for (const addOn of item.addOns) {
        await sql`
          INSERT INTO menu_item_add_ons (menu_item_id, label, price)
          VALUES (${item.id}, ${addOn.label}, ${addOn.price})
          ON CONFLICT DO NOTHING;
        `;
      }
    }
  }
  console.log(`Seeded ${menuItems.length} menu items.`);
  console.log('Seed complete.');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
