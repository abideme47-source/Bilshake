import { sql } from '@/lib/db';
import { unstable_cache } from 'next/cache';

export const getCachedMenu = unstable_cache(
  async () => {
    const [categories, items, sizes, addOns] = await Promise.all([
      sql`SELECT id, name_en AS "nameEn", name_am AS "nameAm", type FROM categories ORDER BY id`,
      sql`SELECT id, name_en AS "nameEn", name_am AS "nameAm", type, category_id AS "categoryId", price, image_url AS "imageUrl", description_en AS "descriptionEn", ingredients, fasting, available, sort_order, suggested_drink_ids AS "suggestedDrinkIds" FROM menu_items ORDER BY sort_order`,
      sql`SELECT menu_item_id AS "menuItemId", label, price FROM menu_item_sizes ORDER BY menu_item_id, id`,
      sql`SELECT menu_item_id AS "menuItemId", label, price FROM menu_item_add_ons ORDER BY menu_item_id, id`,
    ]);

    const sizeMap = new Map<string, { label: string; price: number }[]>();
    for (const s of sizes) {
      const arr = sizeMap.get(s.menuItemId) ?? [];
      arr.push({ label: s.label, price: Number(s.price) });
      sizeMap.set(s.menuItemId, arr);
    }

    const addOnMap = new Map<string, { label: string; price: number }[]>();
    for (const a of addOns) {
      const arr = addOnMap.get(a.menuItemId) ?? [];
      arr.push({ label: a.label, price: Number(a.price) });
      addOnMap.set(a.menuItemId, arr);
    }

    const menuItems = items.map((item) => ({
      id: item.id,
      nameEn: item.nameEn,
      nameAm: item.nameAm,
      type: item.type,
      categoryId: item.categoryId,
      price: Number(item.price),
      imageUrl: item.imageUrl,
      descriptionEn: item.descriptionEn,
      ingredients: item.ingredients ?? [],
      fasting: item.fasting,
      available: item.available,
      sizes: sizeMap.get(item.id) ?? [],
      addOns: addOnMap.get(item.id) ?? [],
      suggestedDrinkIds: item.suggestedDrinkIds ?? [],
    }));

    return {
      categories: categories.map((c) => ({
        id: c.id,
        nameEn: c.nameEn,
        nameAm: c.nameAm,
        type: c.type,
      })),
      items: menuItems,
    };
  },
  ['menu-data'],
  { tags: ['menu-data'], revalidate: 3600 }
);
