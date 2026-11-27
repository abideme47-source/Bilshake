'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, StickyNote } from 'lucide-react'
import { useLanguage } from '@/lib/language'

const money = (value: number) => value.toLocaleString('en-US')
export function OrderTracking({ token }: { token: string }) {
  const { text, language } = useLanguage()
  const reducedMotion = useReducedMotion()
  const [order, setOrder] = useState<{ number: number; status: string; total: number; items: Array<{ name: string; nameEn: string; nameAm: string; size: string | null; addOns: string[]; note: string; quantity: number; linePrice: number; imageUrl: string }> } | undefined>()
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const update = async () => {
      if (!token) {
        setNotFound(true)
        return
      }
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(token)}`)
        if (res.status === 404) {
          setNotFound(true)
          return
        }
        if (res.ok) {
          const data = await res.json()
          setOrder({ number: Number(data.number), status: data.status, total: Number(data.total), items: data.items })
        }
      } catch {
        // Silently retry on next poll
      }
    }
    update()
    const timer = window.setInterval(update, 5000)
    return () => window.clearInterval(timer)
  }, [token])

  if (notFound || (!order && !token)) {
    return <main className="flow-shell"><header className="flow-header"><Link href="/" className="flow-back" aria-label={text('Back to home')}><ArrowLeft/></Link></header><p className="tracking-missing">{text('Order not found')}</p></main>
  }
  if (!order) {
    return <main className="flow-shell"><header className="flow-header"><Link href="/" className="flow-back" aria-label={text('Back to home')}><ArrowLeft/></Link></header><p className="tracking-missing">Loading order</p></main>
  }
  const steps = ['pending', 'cooking', 'ready'] as const
  const active = steps.indexOf(order.status as typeof steps[number])
  if (active === -1) return <main className="flow-shell tracking-page"><header className="flow-header"><Link href="/" className="flow-back" aria-label={text('Back to home')}><ArrowLeft/></Link></header><p>{text('Order not found')}</p></main>
  return <motion.main className="flow-shell tracking-page" initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reducedMotion ? 0 : .15 }}>
    <header className="flow-header"><Link href="/" className="flow-back" aria-label={text('Back to home')}><ArrowLeft/></Link><div><span className="eyebrow">{text('Order number')}</span><h1>#{String(order.number).padStart(3, '0')}</h1></div></header>
    <p className="placed-time">{new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p>
    <ol className={`status-steps status-${order.status}`}>{steps.map((step, index) => <li key={step} className={index < active ? 'complete' : index === active ? 'current' : 'future'}><span className="status-dot">{index < active ? '✓' : ''}</span><strong>{text(step[0].toUpperCase() + step.slice(1))}</strong></li>)}</ol>
    <section className="tracking-items"><h2>{text('Your order')}</h2>{order.items.map((item, index) => <article className="tracking-item" key={`${item.name}-${index}`}><div><strong>{language === 'am' && item.nameAm ? item.nameAm : item.nameEn ?? item.name}</strong><p>{[item.size, ...item.addOns].filter(Boolean).join(' · ')}</p>{item.note && <small className="order-note"><StickyNote size={13} aria-hidden="true"/><span>{text('Note')}: {item.note}</span></small>}<span>× {item.quantity}</span></div><b>{money(item.linePrice)} {text('Birr')}</b></article>)}
      <div className="order-total"><span>{text('Total')}</span><strong>{money(order.total)} {text('Birr')}</strong></div></section>
    <footer className="tracking-actions"><Link className="confirm-order" href="/menu/food">{text('Order more')}</Link><Link className="home-outline" href="/">{text('Back to home')}</Link></footer>
  </motion.main>
}
