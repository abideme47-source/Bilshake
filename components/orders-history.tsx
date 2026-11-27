'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Phone } from 'lucide-react'
import { settings } from '@/data/settings'
import { useLanguage } from '@/lib/language'
import { HistoryBackLink } from '@/components/history-back-link'

const money = (value: number) => value.toLocaleString('en-US')
export function OrdersHistory() {
  const { text } = useLanguage()
  const [orders, setOrders] = useState<Array<{ number: number; token: string; status: string; total: number; itemCount: number; businessDate: string }>>([]);

  useEffect(() => {
    const refreshOrders = async () => {
      const tokens = JSON.parse(localStorage.getItem('bilshake-order-tokens') || '[]')
      const results = []
      for (const token of tokens) {
        try {
          const res = await fetch(`/api/orders/${encodeURIComponent(token)}`)
          if (res.ok) {
            const data = await res.json()
            const d = new Date(data.businessDate)
            const day = String(d.getUTCDate()).padStart(2, '0')
            const month = d.toLocaleString('en-US', { month: 'short' })
            results.push({ number: data.number, token, status: data.status, total: Number(data.total), itemCount: data.items.length, businessDate: `${day} ${month}` })
          }
        } catch {
          // skip failed fetches
        }
      }
      results.sort((a, b) => b.number - a.number)
      setOrders(results)
    }
    refreshOrders()
    const timer = window.setInterval(refreshOrders, 5000)
    return () => window.clearInterval(timer)
  }, [])

  return <main className="flow-shell history-page"><header className="flow-header"><HistoryBackLink href="/" className="flow-back" ariaLabel={text('Back to home')}><ArrowLeft/></HistoryBackLink><h1>{text('My orders')}</h1></header>
    {orders.length ? <div className="history-list">{orders.map((order) => <Link href={`/order/${order.token}`} className="history-card" key={order.token}><div className="history-card-top"><strong>#{String(order.number).padStart(3, '0')}</strong><span className="order-date">{order.businessDate}</span><span className={`status-chip ${order.status}`}>{text(order.status[0].toUpperCase() + order.status.slice(1))}</span></div><p>{order.itemCount} {text('items')}</p><b>{money(order.total)} {text('Birr')}</b></Link>)}</div> : <section className="order-empty"><p>{text('No orders yet')}</p><Link href="/menu/food">{text('Browse menu')}</Link></section>}
    <div className="bottom-call-wrap history-dock"><a className="call-button call-only" href={settings.phoneHref} aria-label={text('Call to order')}><span className="phone-mark"><Phone size={17}/></span><span className="call-copy">{text('Call to order')}</span></a></div>
  </main>
}
