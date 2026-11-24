import type { MenuType } from './categories'

export type MenuBadge = 'New' | 'Popular' | 'Spicy'
export type PriceOption = { label: string; price: number }

export type MenuItem = {
  id: string
  nameEn: string
  nameAm: string
  type: MenuType
  categoryId: string
  price: number
  imageUrl: string
  descriptionEn: string
  ingredients?: string[]
  fasting: boolean
  sizes?: PriceOption[]
  addOns?: PriceOption[]
  badges: MenuBadge[]
  available: boolean
  suggestedDrinkIds?: string[]
}

type ItemSeed = {
  id: string
  nameEn: string
  nameAm: string
  categoryId: string
  price: number
  fasting: boolean
  ingredients?: string[]
  badges?: MenuBadge[]
  available?: boolean
  sizes?: PriceOption[]
  addOns?: PriceOption[]
  suggestedDrinkIds?: string[]
}

const categoryImages: Record<string, string> = {
  smoothies: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=85',
  juices: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=800&q=85',
  burgers: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=85',
  pizza: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=800&q=85',
  shawarma: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=800&q=85',
  sandwiches: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=85',
  'sides-and-light-bites': 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=85',
  salads: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=85',
}

const descriptions: Record<string, string> = {
  smoothies: 'A creamy, freshly blended drink made to order.',
  juices: 'Freshly prepared with ripe fruit and served chilled.',
  burgers: 'A toasted bun layered with a juicy patty and fresh toppings.',
  pizza: 'Baked fresh with a golden crust and generous toppings.',
  shawarma: 'Warmly wrapped with savory filling and house seasoning.',
  sandwiches: 'Freshly assembled with soft bread and satisfying fillings.',
  'sides-and-light-bites': 'A fresh, simple bite prepared to order.',
  salads: 'A crisp, refreshing mix prepared fresh each day.',
}

const smoothiePrices = [180, 150, 160, 180, 140, 140, 160, 120, 120, 150, 150, 160, 140, 130]
const juicePrices = [100, 100, 90, 100, 120, 110, 80, 90, 100, 110, 100, 120]
const burgerPrices = [180, 280, 320, 350, 300, 190, 270, 230]
const pizzaPrices = [220, 300, 240, 260, 270, 280, 240]
const shawarmaPrices = [180, 250, 320]
const sandwichPrices = [140, 210, 270, 290, 160]
const sidePrices = [100, 150, 140, 170]
const saladPrices = [240, 280]

const seeds: ItemSeed[] = [
  { id: 'bil-special-shake', nameEn: 'Bil special shake', nameAm: 'ቢል ስፔሻል ሼክ', categoryId: 'smoothies', price: smoothiePrices[0], fasting: false, ingredients: ['milk', 'avocado', 'chocolate syrup', 'strawberry', 'ginger', 'mango', 'honey'], badges: ['Popular'], suggestedDrinkIds: ['mango-juice', 'strawberry-juice'] },
  { id: 'chocolate-shake', nameEn: 'Chocolate shake', nameAm: 'ቼኮሌት ሼክ', categoryId: 'smoothies', price: smoothiePrices[1], fasting: false },
  { id: 'strawberry-shake', nameEn: 'Strawberry shake', nameAm: 'ስትሮው በሪ ሼክ', categoryId: 'smoothies', price: smoothiePrices[2], fasting: false, badges: ['Popular'] },
  { id: 'mixed-shake', nameEn: 'Mixed shake', nameAm: 'ሚክስድ ሼክ', categoryId: 'smoothies', price: smoothiePrices[3], fasting: false },
  { id: 'milkshake', nameEn: 'Milkshake', nameAm: 'ሚልክ ሼክ', categoryId: 'smoothies', price: smoothiePrices[4], fasting: false },
  { id: 'mango-shake', nameEn: 'Mango shake', nameAm: 'ማንጎ ሼክ', categoryId: 'smoothies', price: smoothiePrices[5], fasting: false },
  { id: 'mango-banana-shake', nameEn: 'Mango with banana shake', nameAm: 'ማንጎ በሙዝ ሼክ', categoryId: 'smoothies', price: smoothiePrices[6], fasting: false },
  { id: 'banana-shake', nameEn: 'Banana shake', nameAm: 'ባናና ሼክ', categoryId: 'smoothies', price: smoothiePrices[7], fasting: false },
  { id: 'carrot-shake', nameEn: 'Carrot shake', nameAm: 'ካሮት ሼክ', categoryId: 'smoothies', price: smoothiePrices[8], fasting: false },
  { id: 'carrot-mixed-shake', nameEn: 'Carrot mixed shake', nameAm: 'ካሮት ሚክስድ ሼክ', categoryId: 'smoothies', price: smoothiePrices[9], fasting: false },
  { id: 'carrot-orange-shake', nameEn: 'Carrot with orange shake', nameAm: 'ብርቱካን በካሮት ሼክ', categoryId: 'smoothies', price: smoothiePrices[10], fasting: false },
  { id: 'apple-smoothie', nameEn: 'Apple smoothie', nameAm: 'አፕል ስሙዚ ሼክ', categoryId: 'smoothies', price: smoothiePrices[11], fasting: false },
  { id: 'pineapple-shake', nameEn: 'Pineapple shake', nameAm: 'አናናስ ሼክ', categoryId: 'smoothies', price: smoothiePrices[12], fasting: false },
  { id: 'moka-juice', nameEn: 'Moka juice', nameAm: 'ሞካ ክስ', categoryId: 'smoothies', price: smoothiePrices[13], fasting: false },
  { id: 'mango-juice', nameEn: 'Mango juice', nameAm: 'ማንጎ ጁስ', categoryId: 'juices', price: juicePrices[0], fasting: true, sizes: [{ label: 'Small', price: 100 }, { label: 'Large', price: 140 }] },
  { id: 'avocado-juice', nameEn: 'Avocado juice', nameAm: 'አቮካዶ ጁስ', categoryId: 'juices', price: juicePrices[1], fasting: true, sizes: [{ label: 'Small', price: 100 }, { label: 'Large', price: 140 }] },
  { id: 'papaya-juice', nameEn: 'Papaya juice', nameAm: 'ፓፓያ ጁስ', categoryId: 'juices', price: juicePrices[2], fasting: true, sizes: [{ label: 'Small', price: 90 }, { label: 'Large', price: 120 }] },
  { id: 'pineapple-juice', nameEn: 'Pineapple juice', nameAm: 'አናናስ ጁስ', categoryId: 'juices', price: juicePrices[3], fasting: true, sizes: [{ label: 'Small', price: 100 }, { label: 'Large', price: 140 }] },
  { id: 'bil-spris-juice', nameEn: 'Bil spris juice', nameAm: 'ቢል ስፕሪስ ጁስ', categoryId: 'juices', price: juicePrices[4], fasting: true, available: false, sizes: [{ label: 'Small', price: 120 }, { label: 'Large', price: 160 }] },
  { id: 'strawberry-juice', nameEn: 'Strawberry juice', nameAm: 'ስትሮው ቤሪ ጁስ', categoryId: 'juices', price: juicePrices[5], fasting: true, sizes: [{ label: 'Small', price: 110 }, { label: 'Large', price: 150 }] },
  { id: 'orange-juice', nameEn: 'Orange juice', nameAm: '', categoryId: 'juices', price: juicePrices[6], fasting: true, sizes: [{ label: 'Small', price: 80 }, { label: 'Large', price: 100 }] },
  { id: 'guava-juice', nameEn: 'Guava juice', nameAm: 'ዘይቱን ጁስ', categoryId: 'juices', price: juicePrices[7], fasting: true, sizes: [{ label: 'Small', price: 90 }, { label: 'Large', price: 120 }] },
  { id: 'flaxseed-juice', nameEn: 'Flaxseed juice', nameAm: 'ተልባ ጁስ', categoryId: 'juices', price: juicePrices[8], fasting: true, sizes: [{ label: 'Small', price: 100 }, { label: 'Large', price: 130 }] },
  { id: 'flaxseed-fruit-juice', nameEn: 'Flaxseed with banana, papaya or avocado', nameAm: 'ተልባ በሙዝ/ፓፓያ/አቮካዶ', categoryId: 'juices', price: juicePrices[9], fasting: true, sizes: [{ label: 'Small', price: 110 }, { label: 'Large', price: 150 }] },
  { id: 'habhab-juice', nameEn: 'Habhab juice (watermelon)', nameAm: '', categoryId: 'juices', price: juicePrices[10], fasting: true, sizes: [{ label: 'Small', price: 100 }, { label: 'Large', price: 140 }] },
  { id: 'fruit-punch', nameEn: 'Fruit punch', nameAm: 'ፍሩት ፐንች', categoryId: 'juices', price: juicePrices[11], fasting: true, sizes: [{ label: 'Small', price: 120 }, { label: 'Large', price: 170 }] },
  { id: 'normal-beef-burger', nameEn: 'Normal beef burger', nameAm: 'ቢፍ በርገር', categoryId: 'burgers', price: burgerPrices[0], fasting: false },
  { id: 'double-beef-burger', nameEn: 'Double beef burger', nameAm: 'ደብል ቢፍ በርገር', categoryId: 'burgers', price: burgerPrices[1], fasting: false },
  { id: 'double-special-beef-burger', nameEn: 'Double special beef burger', nameAm: '', categoryId: 'burgers', price: burgerPrices[2], fasting: false, badges: ['Spicy'] },
  { id: 'bil-special-beef-burger', nameEn: 'Bil special beef burger', nameAm: 'ቢል ስፔሻል በርገር', categoryId: 'burgers', price: burgerPrices[3], fasting: false, suggestedDrinkIds: ['bil-special-shake', 'mango-juice', 'strawberry-juice'] },
  { id: 'bil-freedom-burger', nameEn: 'Bil freedom burger', nameAm: 'ቢል ነፃነት በርገር', categoryId: 'burgers', price: burgerPrices[4], fasting: false },
  { id: 'normal-chicken-burger', nameEn: 'Normal chicken burger', nameAm: 'ቢል ዶሮ በርገር', categoryId: 'burgers', price: burgerPrices[5], fasting: false },
  { id: 'special-chicken-burger', nameEn: 'Special chicken burger', nameAm: '', categoryId: 'burgers', price: burgerPrices[6], fasting: false },
  { id: 'cheese-burger', nameEn: 'Cheese burger', nameAm: 'ቺዝ በርገር', categoryId: 'burgers', price: burgerPrices[7], fasting: false },
  { id: 'pizza-medium', nameEn: 'Pizza medium', nameAm: 'መካከለኛ ፒዛ', categoryId: 'pizza', price: pizzaPrices[0], fasting: false, sizes: [{ label: 'Small', price: 220 }, { label: 'Medium', price: 290 }, { label: 'Large', price: 360 }] },
  { id: 'bil-special-pizza', nameEn: 'Bil special pizza', nameAm: 'ቢል ስፔሻል ፒዛ', categoryId: 'pizza', price: pizzaPrices[1], fasting: false, badges: ['Popular'], sizes: [{ label: 'Small', price: 300 }, { label: 'Medium', price: 380 }, { label: 'Large', price: 450 }] },
  { id: 'tuna-pizza', nameEn: 'Tuna pizza (margherita)', nameAm: 'ቱና ፒዛ', categoryId: 'pizza', price: pizzaPrices[2], fasting: false, sizes: [{ label: 'Small', price: 240 }, { label: 'Medium', price: 310 }, { label: 'Large', price: 390 }] },
  { id: 'tuna-cheese-pizza', nameEn: 'Tuna pizza with cheese', nameAm: 'ቱና ፒዛ በቺዝ', categoryId: 'pizza', price: pizzaPrices[3], fasting: false, sizes: [{ label: 'Small', price: 260 }, { label: 'Medium', price: 340 }, { label: 'Large', price: 420 }] },
  { id: 'chicken-pizza', nameEn: 'Chicken pizza', nameAm: 'ዶሮ ፒዛ', categoryId: 'pizza', price: pizzaPrices[4], fasting: false, sizes: [{ label: 'Small', price: 270 }, { label: 'Medium', price: 360 }, { label: 'Large', price: 440 }] },
  { id: 'beef-pizza', nameEn: 'Beef pizza', nameAm: 'ቢፍ ፒዛ', categoryId: 'pizza', price: pizzaPrices[5], fasting: false, sizes: [{ label: 'Small', price: 280 }, { label: 'Medium', price: 370 }, { label: 'Large', price: 450 }] },
  { id: 'vegetable-pizza', nameEn: 'Vegetable pizza', nameAm: 'አትክልት ፒዛ', categoryId: 'pizza', price: pizzaPrices[6], fasting: true, sizes: [{ label: 'Small', price: 240 }, { label: 'Medium', price: 320 }, { label: 'Large', price: 400 }] },
  { id: 'normal-shawarma', nameEn: 'Normal shawarma', nameAm: 'ኖርማል ሸዋርማ', categoryId: 'shawarma', price: shawarmaPrices[0], fasting: false },
  { id: 'chicken-cheese-shawarma', nameEn: 'Chicken cheese shawarma', nameAm: 'ቺክን ቺዝ ሸዋርማ', categoryId: 'shawarma', price: shawarmaPrices[1], fasting: false, available: false },
  { id: 'bil-special-shawarma', nameEn: 'Bil special shawarma', nameAm: 'ስፔሻል ሸዋርማ', categoryId: 'shawarma', price: shawarmaPrices[2], fasting: false },
  { id: 'egg-sandwich', nameEn: 'Egg sandwich', nameAm: 'እንቁላል ሳንድዊች', categoryId: 'sandwiches', price: sandwichPrices[0], fasting: false },
  { id: 'club-tuna-sandwich', nameEn: 'Club sandwich with tuna', nameAm: 'ክለብ ሳንድዊች በቱና', categoryId: 'sandwiches', price: sandwichPrices[1], fasting: false },
  { id: 'bil-special-club-sandwich', nameEn: 'Bil special club sandwich', nameAm: 'ቢል ስፔሻል ሳንድዊች', categoryId: 'sandwiches', price: sandwichPrices[2], fasting: false },
  { id: 'club-tuna-special-sandwich', nameEn: 'Club sandwich with tuna special', nameAm: 'ክለብ ሳንድዊች በቱና ስፔሻል', categoryId: 'sandwiches', price: sandwichPrices[3], fasting: false },
  { id: 'vegetable-sandwich', nameEn: 'Vegetable sandwich', nameAm: 'አትክልት ሳንድዊች', categoryId: 'sandwiches', price: sandwichPrices[4], fasting: true },
  { id: 'french-fries', nameEn: 'French fries', nameAm: '', categoryId: 'sides-and-light-bites', price: sidePrices[0], fasting: true },
  { id: 'loaded-fries', nameEn: 'Loaded fries', nameAm: 'የጣፈጠ ችፕስ', categoryId: 'sides-and-light-bites', price: sidePrices[1], fasting: true, ingredients: ['mayonnaise', 'ketchup'] },
  { id: 'avocado-bread', nameEn: 'Avocado with bread', nameAm: 'አቮካዶ በዳቦ', categoryId: 'sides-and-light-bites', price: sidePrices[2], fasting: true },
  { id: 'egged-avocado-bread', nameEn: 'Egged avocado with bread', nameAm: 'እንቁላል በአቮካዶ በዳቦ', categoryId: 'sides-and-light-bites', price: sidePrices[3], fasting: false },
  { id: 'bil-special-salad', nameEn: 'Bil special salad', nameAm: 'ቢል ስፔሻል ሳላድ', categoryId: 'salads', price: saladPrices[0], fasting: true },
  { id: 'bil-special-fruit-vegetable-combo', nameEn: 'Bil special fruit and vegetable combo', nameAm: 'ቢል ስፔሻል ኮንቦ', categoryId: 'salads', price: saladPrices[1], fasting: true, ingredients: ['lettuce', 'papaya', 'avocado', 'banana', 'tomato', 'olive oil'] },
]

const burgerAddOns: PriceOption[] = [
  { label: 'Extra cheese', price: 30 },
  { label: 'Extra patty', price: 80 },
]

export const menuItems: MenuItem[] = seeds.map((seed) => {
  const type: MenuType = ['smoothies', 'juices'].includes(seed.categoryId) ? 'drink' : 'food'
  const defaultDrinkSizes = type === 'drink' && !seed.sizes
    ? [{ label: 'Small', price: seed.price }, { label: 'Large', price: seed.price + 40 }]
    : undefined
  return {
    ...seed,
    type,
    imageUrl: categoryImages[seed.categoryId],
    descriptionEn: descriptions[seed.categoryId],
    badges: seed.badges ?? [],
    available: seed.available ?? true,
    sizes: seed.sizes ?? defaultDrinkSizes,
    addOns: seed.categoryId === 'burgers' ? burgerAddOns : seed.addOns,
  }
})

export const popularDrinks = menuItems.filter((item) => item.type === 'drink' && item.badges.includes('Popular'))
