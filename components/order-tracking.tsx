'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useLanguage } from '@/lib/language'
import { getOrder, type Order } from '@/lib/orders'

const money = (value: number) => value.toLocaleString('en-US')
export function OrderTracking({ number }: { number: number }) {
  const { text, language } = useLanguage()
  const reducedMotion = useReducedMotion()
  const [order, setOrder] = useState<Order | undefined>()
  useEffect(() => {
    const update = () => setOrder(getOrder(number))
    update()
    const timer = window.setInterval(update, 3000)
    return () => window.clearInterval(timer)
  }, [number])
  if (!order) return <main className="flow-shell"><header className="flow-header"><Link href="/" className="flow-back" aria-label={text('Back to home')}><ArrowLeft/></Link></header><p className="tracking-missing">{text('No orders yet')}</p></main>
  const steps = ['pending', 'cooking', 'ready'] as const
  const active = steps.indexOf(order.status)
  return <motion.main className="flow-shell tracking-page" initial={reducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : .25 }}>
    <header className="flow-header"><Link href="/orders" className="flow-back" aria-label={text('My orders')}><ArrowLeft/></Link><div><span className="eyebrow">{text('Order number')}</span><h1>#{order.number}</h1></div></header>
    <p className="placed-time">{new Date(order.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p>
    <ol className={`status-steps status-${order.status}`}>{steps.map((step, index) => <li key={step} className={index < active ? 'complete' : index === active ? 'current' : 'future'}><span className="status-dot">{index < active ? '✓' : ''}</span><strong>{text(step[0].toUpperCase() + step.slice(1))}</strong></li>)}</ol>
    <section className="tracking-items"><h2>{text('Your order')}</h2>{order.items.map((item, index) => <article className="tracking-item" key={`${item.id}-${index}`}><div><strong>{language === 'am' && item.nameAm ? item.nameAm : item.nameEn ?? item.name}</strong><p>{[item.size, ...item.addOns].filter(Boolean).join(' · ')}</p>{item.note && <small>{item.note}</small>}<span>× {item.quantity}</span></div><b>{money(item.linePrice)} {text('Birr')}</b></article>)}
      <div className="order-total"><span>{text('Total')}</span><strong>{money(order.total)} {text('Birr')}</strong></div>{order.tableNumber && <p className="table-number">{text('Table number')}: {order.tableNumber}</p>}
    </section>
    <footer className="tracking-actions"><Link className="confirm-order" href="/menu/food">{text('Order more')}</Link><Link className="home-outline" href="/">{text('Back to home')}</Link></footer>
  </motion.main>
}
