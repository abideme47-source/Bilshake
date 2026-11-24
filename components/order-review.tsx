'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, Minus, Plus, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { menuItems } from '@/data/menu'
import { useCart } from '@/lib/cart'
import { useLanguage } from '@/lib/language'
import { placeOrder } from '@/lib/orders'

const money = (value: number) => value.toLocaleString('en-US')
export function OrderReview() {
  const { items, total, changeQuantity, removeItem, clearCart } = useCart()
  const { text, language } = useLanguage()
  const router = useRouter()
  const reduced = useReducedMotion()
  const [tableNumber, setTableNumber] = useState('')
  const [submitting, setSubmitting] = useState(false)
  function confirm() {
    if (!items.length || submitting) return
    setSubmitting(true)
    const ordered = items.map((line) => { const item = menuItems.find((entry) => entry.id === line.id); return { ...line, name: language === 'am' && item?.nameAm ? item.nameAm : item?.nameEn ?? line.id, nameEn: item?.nameEn ?? line.id, nameAm: item?.nameAm || '', imageUrl: item?.imageUrl ?? '' } })
    const order = placeOrder({ items: ordered, total, ...(tableNumber.trim() ? { tableNumber: tableNumber.trim() } : {}) })
    clearCart()
    router.push(`/order/${order.number}`)
  }
  return <main className="flow-shell order-review">
    <header className="flow-header"><Link href="/" className="flow-back" aria-label={text('Back to home')}><ArrowLeft /></Link><h1>{text('Your order')}</h1></header>
    {items.length ? <>
      <div className="review-list"><AnimatePresence initial={false}>{items.map((line) => {
        const item = menuItems.find((entry) => entry.id === line.id)
        const itemName = language === 'am' && item?.nameAm ? item.nameAm : item?.nameEn ?? line.id
        return <motion.article key={line.key} className="review-item" layout initial={reduced ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={reduced ? undefined : { opacity: 0, height: 0, marginBottom: 0 }} transition={{ duration: .24 }}>
          <img src={item?.imageUrl} alt="" />
          <div className="review-item-copy"><strong>{itemName}</strong><span>{[line.size, ...line.addOns].filter(Boolean).join(' · ')}</span>{line.note && <small>{line.note}</small>}
            <div className="review-controls"><div className="quantity-stepper"><button type="button" aria-label={text('Decrease quantity')} onClick={() => changeQuantity(line.key, line.quantity - 1)}><Minus size={15}/></button><span>{line.quantity}</span><button type="button" aria-label={text('Increase quantity')} onClick={() => changeQuantity(line.key, line.quantity + 1)}><Plus size={15}/></button></div><b>{money(line.linePrice)} {text('Birr')}</b></div>
          </div><button className="review-remove" type="button" aria-label={`${text('Remove')} ${item?.nameEn ?? line.id}`} onClick={() => removeItem(line.key)}><X size={17}/></button>
        </motion.article>
      })}</AnimatePresence></div>
      <label className="table-field">{text('Table number')}<input value={tableNumber} onChange={(event) => setTableNumber(event.target.value)} placeholder="e.g. 7" inputMode="numeric" /></label>
      <div className="order-total"><span>{text('Total')}</span><strong>{money(total)} {text('Birr')}</strong></div>
      <div className="flow-bottom"><button className="confirm-order" type="button" onClick={confirm} disabled={submitting}>{text('Confirm order')}</button></div>
    </> : <section className="order-empty"><p>{text('Your order is empty')}</p><div><Link href="/menu/food">{text('Food')}</Link><Link href="/menu/drink">{text('Drink')}</Link></div></section>}
  </main>
}
