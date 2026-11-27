// TODO: replace with real API
export type OrderStatus = "pending" | "cooking" | "ready"
export type Order = { id: string; time: string; type: "cafe" | "delivery"; table?: string; location?: string; phone?: string; customer?: string; notes?: string; items: { name: string; am?: string; qty: number; price?: number; size?: string; addons?: string[] }[]; total: number; paid: boolean; status: OrderStatus }
export const initialOrders: Order[] = [
  { id: "001", time: "12:42 PM", type: "cafe", table: "04", customer: "Marta Bekele", phone: "+251 911 234 567", items: [{ name: "Classic Smash Burger", am: "ክላሲክ በርገር", qty: 2, price: 650, size: "Regular", addons: ["Extra cheese"] }, { name: "Mango Juice", am: "የማንጎ ጭማቂ", qty: 1, price: 260 }], total: 1560, paid: false, status: "pending", notes: "No onions, please" },
  { id: "002", time: "12:38 PM", type: "delivery", location: "Bole, Atlas area", phone: "+251 912 456 789", customer: "Dawit Tadesse", items: [{ name: "Chicken Shawarma", am: "የዶሮ ሻዋርማ", qty: 1, price: 540, size: "Large" }, { name: "Fresh Lemonade", am: "ትኩስ ሎሚናዴ", qty: 2, price: 210 }], total: 960, paid: true, status: "cooking" },
  { id: "003", time: "12:31 PM", type: "cafe", table: "02", items: [{ name: "Margherita Pizza", am: "ማርጋሪታ ፒዛ", qty: 1, price: 850, size: "Medium" }, { name: "Passion Fruit Juice", am: "የፓሽን ፍራፍሬ ጭማቂ", qty: 1, price: 270 }], total: 1120, paid: true, status: "ready" },
  { id: "004", time: "12:25 PM", type: "cafe", items: [{ name: "Veggie Burger", am: "የአትክልት በርገር", qty: 1, price: 460 }, { name: "French Fries", am: "ፈረንሳይ ጥብስ", qty: 1, price: 260 }], total: 720, paid: false, status: "ready" },
]
export type MenuOption = { name: string; price?: number }
export type MenuItem = { id: number; name: string; am: string; category: string; price: number; type: "fasting" | "non-fasting"; available: boolean; sizes?: MenuOption[]; addons?: MenuOption[] }
export const initialMenu: MenuItem[] = [
  { id: 1, name: "Classic Smash Burger", am: "ክላሲክ በርገር", category: "Burgers", price: 650, type: "non-fasting", available: true, sizes: [{ name: "Regular" }, { name: "Double" }], addons: [{ name: "Extra cheese" }, { name: "Avocado" }] },
  { id: 2, name: "Margherita Pizza", am: "ማርጋሪታ ፒዛ", category: "Pizza", price: 850, type: "non-fasting", available: true, sizes: [{ name: "Small" }, { name: "Medium" }, { name: "Large" }] },
  { id: 3, name: "Chicken Shawarma", am: "የዶሮ ሻዋርማ", category: "Shawarma", price: 540, type: "non-fasting", available: true },
  { id: 4, name: "Fresh Mango Juice", am: "ትኩስ የማንጎ ጭማቂ", category: "Juices", price: 260, type: "non-fasting", available: true },
  { id: 5, name: "Fasting Veggie Wrap", am: "የጾም አትክልት ጥቅል", category: "Fasting", price: 390, type: "fasting", available: false },
  { id: 6, name: "Classic Cheese Pizza", am: "ክላሲክ አይብ ፒዛ", category: "Pizza", price: 920, type: "non-fasting", available: true },
]
export type Banner = { id: number; title: string; am: string; from?: string; until?: string; active: boolean; color: string }
export const initialBanners: Banner[] = [
  { id: 1, title: "A little joy in every bite", am: "በእያንዳንዱ ንክሻ ደስታ", until: "2026-11-30", active: true, color: "#f5e3d3" },
  { id: 2, title: "Freshly made, just for you", am: "ለእርስዎ ትኩስ የተዘጋጀ", active: true, color: "#dcecf2" },
  { id: 3, title: "Make lunch a little brighter", am: "ምሳዎን የበለጠ ያሳምሩ", active: false, color: "#ece7e0" },
]
export const salesByHour = [ { label: "9a", cafe: 450, delivery: 150 }, { label: "10a", cafe: 800, delivery: 260 }, { label: "11a", cafe: 620, delivery: 420 }, { label: "12p", cafe: 1320, delivery: 760 }, { label: "1p", cafe: 1680, delivery: 920 }, { label: "2p", cafe: 1040, delivery: 530 }, { label: "3p", cafe: 720, delivery: 340 }, { label: "4p", cafe: 1180, delivery: 680 }, { label: "5p", cafe: 960, delivery: 780 }, { label: "6p", cafe: 1430, delivery: 850 }, { label: "7p", cafe: 1120, delivery: 640 }, { label: "8p", cafe: 840, delivery: 460 } ]
export const salesByDay = [ { label: "Mon", cafe: 8450, delivery: 3220 }, { label: "Tue", cafe: 7100, delivery: 4010 }, { label: "Wed", cafe: 9320, delivery: 4570 }, { label: "Thu", cafe: 8060, delivery: 5130 }, { label: "Fri", cafe: 11200, delivery: 7320 }, { label: "Sat", cafe: 12600, delivery: 8450 }, { label: "Sun", cafe: 10540, delivery: 6580 } ]
export const salesByMonth = Array.from({ length: 30 }, (_, index) => {
  const base = salesByDay[index % salesByDay.length]
  const variation = 0.82 + ((index * 17) % 31) / 100
  return { label: String(index + 1), cafe: Math.round(base.cafe * variation), delivery: Math.round(base.delivery * variation) }
})
export const salesSummary = {
  Today: { paid: 18200, pending: 2400, orders: "42", period: "Nov 25" },
  "7 days": { paid: 68540, pending: 38010, orders: "286", period: "Nov 19 – Nov 25" },
  "30 days": { paid: 281650, pending: 172840, orders: "1,142", period: "Oct 27 – Nov 25" },
}
