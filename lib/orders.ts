export type OrderStatus = 'pending' | 'cooking' | 'ready'
export type OrderedItem = { id: string; name: string; nameEn?: string; nameAm?: string; size: string | null; addOns: string[]; note: string; quantity: number; linePrice: number; imageUrl: string }
export type Order = { id: string; number: number; createdAt: string; status: OrderStatus; items: OrderedItem[]; total: number; tableNumber?: string }
const STORAGE_KEY = 'bilshake-orders-v1'
const read = (): Order[] => { if (typeof window === 'undefined') return []; try { const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); return Array.isArray(value) ? value : [] } catch { return [] } }
const write = (orders: Order[]) => { if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(orders)) }
// TODO: replace this local timer simulation with live updates from the order service.
function advanceSimulatedStatuses(orders: Order[]) {
  const now = Date.now()
  let changed = false
  const next = orders.map((order) => {
    const elapsed = now - new Date(order.createdAt).getTime()
    const status: OrderStatus = elapsed >= 30_000 ? 'ready' : elapsed >= 15_000 ? 'cooking' : 'pending'
    if (status !== order.status) changed = true
    return status === order.status ? order : { ...order, status }
  })
  if (changed) write(next)
  return next
}
export function placeOrder(input: Omit<Order, 'id' | 'number' | 'createdAt' | 'status'>): Order {
  const orders = read()
  const number = Math.max(100, ...orders.map((order) => order.number)) + 1
  const order: Order = { ...input, id: crypto.randomUUID(), number, createdAt: new Date().toISOString(), status: 'pending' }
  write([order, ...orders])
  return order
}
export function getOrder(number: number): Order | undefined { return advanceSimulatedStatuses(read()).find((order) => order.number === number) }
export function getOrders(): Order[] { return advanceSimulatedStatuses(read()).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) }
