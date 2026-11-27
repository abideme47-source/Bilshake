'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, Minus, Plus, StickyNote, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useCart, useCartActions } from '@/lib/cart'
import { useLanguage } from '@/lib/language'
import { HistoryBackLink } from '@/components/history-back-link'

const money = (value: number) => value.toLocaleString('en-US')
export function OrderReview() {
  const { items, total, isLoaded } = useCart()
  const { changeQuantity, removeItem, clearCart, flushCart } = useCartActions()
  const { text, language } = useLanguage()
  const router = useRouter()
  const reduced = useReducedMotion()
  const [tableNumber, setTableNumber] = useState('')
  const [submitting, setSubmitting] = useState(false)
  async function confirm() {
    if (!items.length || submitting) return
    setSubmitting(true)
    const orderItems = items.map((line) => ({ id: line.id, size: line.size, addOns: line.addOns, note: line.note, quantity: line.quantity }))
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: orderItems, ...(tableNumber.trim() ? { tableNumber: tableNumber.trim() } : {}) }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to place order.' }))
      setSubmitting(false)
      return
    }
    const { trackingToken } = await res.json()
    if (trackingToken) {
      const existing = JSON.parse(localStorage.getItem('bilshake-order-tokens') || '[]')
      if (!existing.includes(trackingToken)) {
        existing.push(trackingToken)
        localStorage.setItem('bilshake-order-tokens', JSON.stringify(existing))
      }
    }
    clearCart()
    router.replace(`/order/${trackingToken}`)
  }
  return <main className="flow-shell order-review">
    <header className="flow-header"><HistoryBackLink href="/menu/food" className="flow-back" ariaLabel={text('Back to menu')}><ArrowLeft /></HistoryBackLink><h1>{text('Your order')}</h1></header>
    {items.length ? <>
      <div className="review-list"><AnimatePresence initial={false}>{items.map((line) => {
        const item = menuItems.find((entry) => entry.id === line.id)
        const itemName = language === 'am' && item?.nameAm ? item.nameAm : item?.nameEn ?? line.id
        return <motion.article key={line.key} className="review-item" layout initial={reduced ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={reduced ? undefined : { opacity: 0, height: 0, marginBottom: 0 }} transition={{ duration: .24 }}>
          <Image src={item?.imageUrl ?? ''} alt="" width={64} height={64} sizes="64px" loading="lazy" />
          <div className="review-item-copy"><strong>{itemName}</strong><span>{[line.size, ...line.addOns].filter(Boolean).join(' · ')}</span>{line.note && <small className="order-note"><StickyNote size={13} aria-hidden="true" /><span>{text('Note')}: {line.note}</span></small>}
            <div className="review-controls"><div className="quantity-stepper"><button type="button" aria-label={text('Decrease quantity')} onClick={() => changeQuantity(line.key, line.quantity - 1)}><Minus size={15}/></button><span>{line.quantity}</span><button type="button" aria-label={text('Increase quantity')} onClick={() => changeQuantity(line.key, line.quantity + 1)}><Plus size={15}/></button></div><b>{money(line.linePrice)} {text('Birr')}</b></div>
          </div><button className="review-remove" type="button" aria-label={`${text('Remove')} ${item?.nameEn ?? line.id}`} onClick={() => removeItem(line.key)}><X size={17}/></button>
        </motion.article>
      })}</AnimatePresence></div>
      <label className="table-field">{text('Table number')}<input value={tableNumber} onChange={(event) => setTableNumber(event.target.value)} placeholder="e.g. 7" inputMode="numeric" /></label>
      <div className="order-total"><span>{text('Total')}</span><strong>{money(total)} {text('Birr')}</strong></div>
      <div className="flow-bottom"><button className="confirm-order" type="button" onClick={confirm} disabled={submitting}>{text('Confirm order')}</button></div>
    </> : isLoaded ? <section className="order-empty"><p>{text('Your order is empty')}</p><div><Link href="/menu/food" onClick={flushCart} prefetch>{text('Food')}</Link><Link href="/menu/drink" onClick={flushCart} prefetch>{text('Drink')}</Link></div></section> : null}
  </main>
}
