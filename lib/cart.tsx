'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

export type CartLine = {
  key: string
  id: string
  size: string | null
  addOns: string[]
  note: string
  quantity: number
  unitPrice: number
  linePrice: number
}

export type CartLineDraft = Omit<CartLine, 'key' | 'linePrice'>
type CartState = { items: CartLine[]; count: number; total: number; isLoaded: boolean }
type CartActions = {
  addItem: (draft: CartLineDraft) => void
  removeItem: (key: string) => void
  changeQuantity: (key: string, quantity: number) => void
  clearCart: () => void
  flushCart: () => void
}

const CART_STORAGE_KEY = 'bilshake-cart-v1'
const CartContext = createContext<CartState | null>(null)
const CartActionsContext = createContext<CartActions | null>(null)
const CartCountContext = createContext<number | null>(null)

function getLineKey(draft: CartLineDraft) {
  return [draft.id, draft.size ?? '', [...draft.addOns].sort().join(','), draft.note.trim()].join('::')
}

function persist(items: CartLine[]) {
  try { window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items)) } catch { /* Storage may be unavailable. */ }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const itemsRef = useRef<CartLine[]>([])
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CART_STORAGE_KEY)
      if (saved) {
        const parsed: unknown = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          itemsRef.current = parsed as CartLine[]
          setItems(itemsRef.current)
        }
      }
    } catch {
      window.localStorage.removeItem(CART_STORAGE_KEY)
    } finally {
      setIsLoaded(true)
    }
    return () => { if (persistTimerRef.current) clearTimeout(persistTimerRef.current) }
  }, [])

  const update = useCallback((next: CartLine[], immediate = false) => {
    itemsRef.current = next
    setItems(next)
    if (persistTimerRef.current) clearTimeout(persistTimerRef.current)
    if (immediate) persist(next)
    else persistTimerRef.current = setTimeout(() => persist(itemsRef.current), 100)
  }, [])

  const addItem = useCallback((draft: CartLineDraft) => {
    const key = getLineKey(draft)
    const current = itemsRef.current
    const existing = current.find((item) => item.key === key)
    const next = !existing
      ? [...current, { ...draft, key, linePrice: draft.unitPrice * draft.quantity }]
      : current.map((item) => item.key === key
        ? { ...item, quantity: item.quantity + draft.quantity, linePrice: item.unitPrice * (item.quantity + draft.quantity) }
        : item)
    update(next, true)
  }, [update])
  const removeItem = useCallback((key: string) => update(itemsRef.current.filter((item) => item.key !== key)), [update])
  const changeQuantity = useCallback((key: string, quantity: number) => update(quantity <= 0
    ? itemsRef.current.filter((item) => item.key !== key)
    : itemsRef.current.map((item) => item.key === key ? { ...item, quantity, linePrice: item.unitPrice * quantity } : item)), [update])
  const clearCart = useCallback(() => update([], true), [update])
  const flushCart = useCallback(() => {
    if (persistTimerRef.current) clearTimeout(persistTimerRef.current)
    persist(itemsRef.current)
  }, [])

  const count = items.reduce((sum, item) => sum + item.quantity, 0)
  const state = useMemo(() => ({ items, count, total: items.reduce((sum, item) => sum + item.linePrice, 0), isLoaded }), [items, count, isLoaded])
  const actions = useMemo(() => ({ addItem, removeItem, changeQuantity, clearCart, flushCart }), [addItem, removeItem, changeQuantity, clearCart, flushCart])

  return <CartActionsContext.Provider value={actions}><CartCountContext.Provider value={count}><CartContext.Provider value={state}>{children}</CartContext.Provider></CartCountContext.Provider></CartActionsContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}

export function useCartActions() {
  const context = useContext(CartActionsContext)
  if (!context) throw new Error('useCartActions must be used within CartProvider')
  return context
}

export function useCartCount() {
  const context = useContext(CartCountContext)
  if (context === null) throw new Error('useCartCount must be used within CartProvider')
  return context
}
