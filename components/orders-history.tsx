'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Phone } from 'lucide-react'
import { settings } from '@/data/settings'
import { useLanguage } from '@/lib/language'
import { getOrders, type Order } from '@/lib/orders'

const money = (value: number) => value.toLocaleString('en-US')
export function OrdersHistory() {
  const { text } = useLanguage()
  const [orders, setOrders] = useState<Order[]>([])
  useEffect(() => {
    const refreshOrders = () => setOrders(getOrders())
    refreshOrders()
    const timer = window.setInterval(refreshOrders, 3000)
    return () => window.clearInterval(timer)
  }, [])
  return <main className="flow-shell history-page"><header className="flow-header"><Link href="/" className="flow-back" aria-label={text('Back to home')}><ArrowLeft/></Link><h1>{text('My orders')}</h1></header>
    {orders.length ? <div className="history-list">{orders.map((order) => <Link href={`/order/${order.number}`} className="history-card" key={order.id}><div className="history-card-top"><strong>#{order.number}</strong><span className={`status-chip ${order.status}`}>{text(order.status[0].toUpperCase() + order.status.slice(1))}</span></div><p>{new Date(order.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })} · {order.items.reduce((sum, item) => sum + item.quantity, 0)} {text('items')}</p><b>{money(order.total)} {text('Birr')}</b></Link>)}</div> : <section className="order-empty"><p>{text('No orders yet')}</p><Link href="/menu/food">{text('Browse menu')}</Link></section>}
    <div className="bottom-call-wrap history-dock"><a className="call-button call-only" href={settings.phoneHref} aria-label={text('Call to order')}><span className="phone-mark"><Phone size={17}/></span><span className="call-copy">{text('Call to order')}</span></a></div>
  </main>
}
