'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
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

type CartContextValue = {
  items: CartLine[]
  count: number
  total: number
  addItem: (draft: CartLineDraft) => void
  removeItem: (key: string) => void
  changeQuantity: (key: string, quantity: number) => void
  clearCart: () => void
}

const CART_STORAGE_KEY = 'bilshake-cart-v1'
const CartContext = createContext<CartContextValue | null>(null)

function getLineKey(draft: CartLineDraft) {
  return [draft.id, draft.size ?? '', [...draft.addOns].sort().join(','), draft.note.trim()].join('::')
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CART_STORAGE_KEY)
      if (saved) {
        const parsed: unknown = JSON.parse(saved)
        if (Array.isArray(parsed)) setItems(parsed as CartLine[])
      }
    } catch {
      window.localStorage.removeItem(CART_STORAGE_KEY)
    } finally {
      setHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  }, [hydrated, items])

  const value = useMemo<CartContextValue>(() => ({
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    total: items.reduce((sum, item) => sum + item.linePrice, 0),
    addItem: (draft) => setItems((current) => {
      const key = getLineKey(draft)
      const existing = current.find((item) => item.key === key)
      if (!existing) return [...current, { ...draft, key, linePrice: draft.unitPrice * draft.quantity }]
      return current.map((item) => item.key === key
        ? { ...item, quantity: item.quantity + draft.quantity, linePrice: item.unitPrice * (item.quantity + draft.quantity) }
        : item)
    }),
    removeItem: (key) => setItems((current) => current.filter((item) => item.key !== key)),
    changeQuantity: (key, quantity) => setItems((current) => quantity <= 0
      ? current.filter((item) => item.key !== key)
      : current.map((item) => item.key === key ? { ...item, quantity, linePrice: item.unitPrice * quantity } : item)),
    clearCart: () => setItems([]),
  }), [hydrated, items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
