"use client"

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react"
import { createPortal } from "react-dom"
import { Check, ChevronDown, ChevronRight, X } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { salesByDay, salesByHour, salesByMonth, salesSummary } from "@/lib/admin-mock"
import type { Language, TranslationKey } from "@/data/admin-translations"

type SalesRange = "Today" | "7 days" | "30 days" | "Month"
type ChartView = "Channel" | "Payment" | "Total"
type DayPoint = { key: string; label: string; date: Date; cafe: number; delivery: number; paid: number; pending: number; total: number }
type MonthChoice = { key: string; date: Date }

const monthChoices: MonthChoice[] = [
  { key: "2026-11", date: new Date(2026, 10, 1) },
  { key: "2026-10", date: new Date(2026, 9, 1) },
  { key: "2026-09", date: new Date(2026, 8, 1) },
]
const chartConfig = {
  cafe: { label: "In cafe", color: "#e98a4d" },
  delivery: { label: "Delivery", color: "#b9d9e3" },
  paid: { label: "Paid", color: "#e98a4d" },
  pending: { label: "Pending", color: "#b9d9e3" },
  total: { label: "Total", color: "#e98a4d" },
}
const localeFor = (language: Language) => language === "am" ? "am-ET" : "en-US"
const currencyValue = (value: number, language: Language) => new Intl.NumberFormat(localeFor(language), { maximumFractionDigits: 0 }).format(value)

function makePoint(date: Date, label: string, cafe: number, delivery: number, index: number): DayPoint {
  const total = cafe + delivery
  const paid = Math.round(total * (0.64 + (index % 5) * 0.035))
  return { key: date.toISOString().slice(0, 10), label, date, cafe, delivery, paid, pending: total - paid, total }
}

function useCompactChart() {
  const [compact, setCompact] = useState(false)
  useEffect(() => {
    const media = window.matchMedia("(max-width: 420px)")
    const update = () => setCompact(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])
  return compact
}

export function SalesDashboard({ lang, t }: { lang: Language; t: (key: TranslationKey) => string }) {
  const [range, setRange] = useState<SalesRange>("Today")
  const [view, setView] = useState<ChartView>("Channel")
  const [selectedMonth, setSelectedMonth] = useState(monthChoices[0])
  const [monthMenuOpen, setMonthMenuOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<DayPoint | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const closeDaySheet = useCallback(() => setSelectedDay(null), [])
  const compact = useCompactChart()
  const locale = localeFor(lang)
  const shortMonth = new Intl.DateTimeFormat(locale, { month: "short" }).format(selectedMonth.date)
  const fullMonth = new Intl.DateTimeFormat(locale, { month: "short", year: "numeric" }).format(selectedMonth.date)

  const days = useMemo(() => {
    if (range === "Today") return salesByHour.map((item, index) => {
      const hour = 9 + index
      const date = new Date(2026, 10, 25, hour)
      return makePoint(date, `${hour > 12 ? hour - 12 : hour}${hour < 12 ? " AM" : ""}`, item.cafe, item.delivery, index)
    })
    if (range === "7 days") return salesByDay.map((item, index) => {
      const date = new Date(2026, 10, 19 + index)
      return makePoint(date, new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date), item.cafe, item.delivery, index)
    })
    if (range === "30 days") return salesByMonth.map((item, index) => {
      const date = new Date(2026, 9, 27 + index)
      return makePoint(date, new Intl.DateTimeFormat(locale, { day: "numeric" }).format(date), item.cafe, item.delivery, index)
    })
    const year = selectedMonth.date.getFullYear()
    const month = selectedMonth.date.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return Array.from({ length: daysInMonth }, (_, index) => {
      const base = salesByMonth[index % salesByMonth.length]
      const variation = 0.86 + ((index * 13 + month * 7) % 25) / 100
      const date = new Date(year, month, index + 1)
      return makePoint(date, String(index + 1), Math.round(base.cafe * variation), Math.round(base.delivery * variation), index)
    })
  }, [locale, range, selectedMonth])

  const chartData = useMemo(() => days.map((day) => ({ ...day, cafe: view === "Channel" ? day.cafe : day.cafe, delivery: day.delivery, paid: day.paid, pending: day.pending, total: day.total })), [days, view])
  const maxValue = range === "Today" ? 3000 : Math.ceil(Math.max(...days.map((day) => view === "Channel" ? day.total : view === "Payment" ? day.paid + day.pending : day.total)) / 10000) * 10000
  const ticks = range === "Today" ? [0, 1000, 2000, 3000] : [0, maxValue / 3, (maxValue * 2) / 3, maxValue]
  const summary = range === "Today" ? salesSummary.Today : range === "7 days" ? salesSummary["7 days"] : range === "30 days" ? salesSummary["30 days"] : {
    paid: Math.round(days.reduce((sum, day) => sum + day.paid, 0)),
    pending: Math.round(days.reduce((sum, day) => sum + day.pending, 0)),
    orders: currencyValue(Math.round(days.length * 38.1), lang),
    period: fullMonth,
  }
  const totalForCount = Number(summary.orders.replaceAll(",", ""))
  const rangeIndex = ["Today", "7 days", "30 days", "Month"].indexOf(range)
  const viewIndex = ["Channel", "Payment", "Total"].indexOf(view)
  const yLabel = (value: number) => value === 0 ? "0" : `${Math.round(value / 1000)}k`
  const xInterval = range === "Today" ? (compact ? 1 : 0) : range === "7 days" ? 0 : compact ? 4 : 2
  const xLabel = (value: string, index: number) => range === "Today" ? (index === 0 ? "9 AM" : value.replace(" AM", "").replace(" PM", "")) : value
  const legend = view === "Channel" ? [["legend-orange", t("inCafe")], ["legend-blue", t("delivery")]] : view === "Payment" ? [["legend-orange", t("paidSales")], ["legend-blue", t("pendingSales")]] : [["legend-orange", t("total")]]

  const onChartClick = (event: { activeTooltipIndex?: number | string | null } | undefined) => {
    if (event?.activeTooltipIndex == null) return
    const index = Number(event.activeTooltipIndex)
    if (!Number.isInteger(index) || index < 0 || index >= days.length) return
    setSelectedIndex(index)
    if (range !== "Today") setSelectedDay(days[index] ?? null)
  }

  return <section className="sales-content route-transition" key="sales">
    <div className="range-switch" role="group" aria-label={t("salesRange")} style={{ "--active-index": rangeIndex } as CSSProperties}>
      <span className="segment-pill" aria-hidden="true" />
      {(["Today", "7 days", "30 days", "Month"] as SalesRange[]).map((option) => <button key={option} type="button" className={range === option ? "active" : ""} aria-pressed={range === option} onClick={() => {
        setSelectedIndex(null)
        if (option === "Month") { setRange("Month"); setMonthMenuOpen(true) }
        else { setRange(option); setMonthMenuOpen(false) }
      }}>{range === option && <Check size={12}/ >}{option === "Today" ? t("today") : option === "7 days" ? t("sevenDays") : option === "30 days" ? t("thirtyDays") : <span className="month-option">{range === "Month" ? shortMonth : t("month")}<ChevronDown size={12} /></span>}</button>)}
      {monthMenuOpen && <div className="month-menu" role="menu">{monthChoices.map((month) => <button type="button" role="menuitem" key={month.key} className={month.key === selectedMonth.key ? "selected" : ""} onClick={() => { setSelectedMonth(month); setRange("Month"); setMonthMenuOpen(false); setSelectedIndex(null) }}>{new Intl.DateTimeFormat(locale, { month: "short", year: "numeric" }).format(month.date)}</button>)}</div>}
    </div>

    <div className="chart-card">
      <div className="chart-header"><div className="chart-heading-number"><span className="chart-period">{range === "Today" ? t("totalToday") : range === "7 days" ? t("thisWeek") : range === "30 days" ? t("thisMonth") : fullMonth}</span><h2><span className="chart-currency">ETB</span> <CountUp value={summary.paid} lang={lang} /></h2></div><span className="chart-period chart-range-label">{range === "Today" ? t("today") : range === "7 days" ? t("sevenDays") : range === "30 days" ? t("thirtyDays") : fullMonth}</span></div>
      <div className="view-switch" role="group" aria-label={t("chartView")} style={{ "--active-index": viewIndex } as CSSProperties}><span className="segment-pill" aria-hidden="true" />{(["Channel", "Payment", "Total"] as ChartView[]).map((option) => <button key={option} type="button" className={view === option ? "active" : ""} aria-pressed={view === option} onClick={() => { setView(option); setSelectedIndex(null) }}>{view === option && <Check size={12}/ >}{option === "Channel" ? t("channel") : option === "Payment" ? t("payment") : t("totalView")}</button>)}</div>
      <ChartContainer key={`${range}-${view}-${selectedMonth.key}`} className="sales-chart" config={chartConfig}>
        <BarChart data={chartData} margin={{ top: 10, right: 4, bottom: 0, left: 2 }} barCategoryGap={range === "Today" ? "32%" : "26%"} onClick={onChartClick}>
          <CartesianGrid vertical={false} stroke="#efeeeb" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={9} interval={xInterval} tickFormatter={xLabel} minTickGap={2} />
          <YAxis ticks={ticks} domain={[0, maxValue]} tickLine={false} axisLine={false} tickMargin={5} tickFormatter={yLabel} width={31} />
          <ChartTooltip cursor={false} content={<SalesTooltip lang={lang} t={t} />} />
          {view === "Channel" && <><Bar dataKey="cafe" stackId="sales" fill="var(--color-cafe)" radius={[0, 0, 0, 0]} isAnimationActive={false} shape={<StaggeredBarShape />}>{chartData.map((_, index) => <Cell key={`cafe-${index}`} fillOpacity={selectedIndex === null || selectedIndex === index ? 1 : 0.48} />)}</Bar><Bar dataKey="delivery" stackId="sales" fill="var(--color-delivery)" radius={[4, 4, 0, 0]} isAnimationActive={false} shape={<StaggeredBarShape />}>{chartData.map((_, index) => <Cell key={`delivery-${index}`} fillOpacity={selectedIndex === null || selectedIndex === index ? 1 : 0.48} />)}</Bar></>}
          {view === "Payment" && <><Bar dataKey="paid" stackId="sales" fill="var(--color-paid)" radius={[0, 0, 0, 0]} isAnimationActive={false} shape={<StaggeredBarShape />}>{chartData.map((_, index) => <Cell key={`paid-${index}`} fillOpacity={selectedIndex === null || selectedIndex === index ? 1 : 0.48} />)}</Bar><Bar dataKey="pending" stackId="sales" fill="var(--color-pending)" radius={[4, 4, 0, 0]} isAnimationActive={false} shape={<StaggeredBarShape />}>{chartData.map((_, index) => <Cell key={`pending-${index}`} fillOpacity={selectedIndex === null || selectedIndex === index ? 1 : 0.48} />)}</Bar></>}
          {view === "Total" && <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} isAnimationActive={false} shape={<StaggeredBarShape />}>{chartData.map((_, index) => <Cell key={`total-${index}`} fillOpacity={selectedIndex === null || selectedIndex === index ? 1 : 0.48} />)}</Bar>}
        </BarChart>
      </ChartContainer>
      <div className="chart-legend">{legend.map(([className, label]) => <span key={label}><i className={className} />{label}</span>)}</div>
    </div>

    <div className="stat-grid">
      <StatCard label={t("paidSales")} value={summary.paid} lang={lang} accent wide />
      <StatCard label={t("pendingSales")} value={summary.pending} lang={lang} />
      <StatCard label={t("orderCount")} value={totalForCount} lang={lang} countOnly />
    </div>

    {range === "Today" ? <div className="sales-list"><div className="sales-list-header"><h2>{t("recentSales")}</h2><span>{t("periodToday")}</span></div>{/* today stays an order list; day ranges use the compact day breakdown below */}<div className="today-sales-list">{initialTodayRows.map((order, index) => <div className="sale-row stagger-in" key={order.id} style={{ "--stagger-index": index } as CSSProperties}><strong>#{order.id}</strong><span>{order.time}</span><span>{order.location ? t("delivery") : `${t("table")} ${order.table}`}</span><strong><span className="row-currency">ETB</span> {currencyValue(order.total, lang)}</strong><span className={`payment-tag ${order.paid ? "is-paid" : "is-pending"}`}>{order.paid ? t("paid") : t("pendingPayment")}</span></div>)}</div></div> : <div className="sales-list"><div className="sales-list-header"><h2>{t("dailyBreakdown")}</h2><span>{range === "Month" ? fullMonth : summary.period}</span></div><div className="day-list">{days.map((day, index) => <button type="button" className="sale-row day-row stagger-in" key={day.key} onClick={() => setSelectedDay(day)} style={{ "--stagger-index": index } as CSSProperties} aria-label={`${formatDay(day.date, locale)}. ETB ${currencyValue(day.total, lang)}. ${t("viewDay")}`}><span className="day-date"><strong>{new Intl.DateTimeFormat(locale, { weekday: "short" }).format(day.date)}</strong><small>{new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(day.date)}</small></span><span className="day-progress" aria-hidden="true"><i style={{ width: `${Math.max(5, (day.total / Math.max(...days.map((entry) => entry.total))) * 100)}%` }} /></span><strong className="day-amount"><span className="row-currency">ETB</span> {currencyValue(day.total, lang)}</strong><ChevronRight className="day-chevron" size={16} /></button>)}</div></div>}

    {selectedDay && range !== "Today" && <DaySheet day={selectedDay} lang={lang} t={t} onClose={closeDaySheet} />}
  </section>
}

function StaggeredBarShape({ x, y, width, height, fill, index, fillOpacity }: { x?: number; y?: number; width?: number; height?: number; fill?: string; index?: number; fillOpacity?: number }) {
  return <rect x={x ?? 0} y={y ?? 0} width={width ?? 0} height={height ?? 0} rx={3} fill={fill} fillOpacity={fillOpacity} style={{ transformBox: "fill-box", transformOrigin: "center bottom", animation: "bar-grow .48s ease-out both", animationDelay: `${Math.min((index ?? 0) * 50, 500)}ms` }} />
}

function SalesTooltip({ active, payload, label, lang, t }:  { active?: boolean; payload?: Array<{ name?: string; value?: number }>; label?: string; lang: Language; t: (key: TranslationKey) => string }) {
  if (!active || !payload?.length) return null
  const names: Record<string, TranslationKey> = { cafe: "inCafe", delivery: "delivery", paid: "paidSales", pending: "pendingSales", total: "total" }
  return <div className="sales-tooltip"><strong>{label}</strong>{payload.map((entry, index) => <span key={`${entry.name}-${index}`}><i className={entry.name === "delivery" || entry.name === "pending" ? "legend-blue" : "legend-orange"} />{t(names[entry.name ?? ""] ?? "total")}<b>ETB {currencyValue(Number(entry.value ?? 0), lang)}</b></span>)}</div>
}

const initialTodayRows = [
  { id: "428", time: "12:42 PM", location: "Delivery", table: "04", total: 1560, paid: false },
  { id: "427", time: "12:38 PM", location: "Delivery", table: "02", total: 960, paid: true },
  { id: "426", time: "12:31 PM", location: "", table: "03", total: 1120, paid: true },
]

function StatCard({ label, value, lang, accent, wide, countOnly }: { label: string; value: number; lang: Language; accent?: boolean; wide?: boolean; countOnly?: boolean }) {
  return <div className={`stat-card ${accent ? "stat-accent" : ""} ${wide ? "stat-wide" : ""}`}><span>{label}</span><strong className="stat-value">{!countOnly && <small>ETB</small>}<CountUp value={value} lang={lang} /></strong></div>
}

function CountUp({ value, lang }: { value: number; lang: Language }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) { setCount(value); return }
    let frame = 0
    const start = performance.now()
    const duration = 720
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - progress, 4)
      setCount(Math.round(value * eased))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value])
  return <span className="tabular-value">{currencyValue(count, lang)}</span>
}

function formatDay(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, { weekday: "short", month: "short", day: "numeric" }).format(date)
}

function DaySheet({ day, lang, t, onClose }: { day: DayPoint; lang: Language; t: (key: TranslationKey) => string; onClose: () => void }) {
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const orders = useMemo(() => {
    const daySeed = day.date.getDate()
    const parts = [0.44, 0.34, 0.22]
    return parts.map((portion, index) => {
      const total = index === parts.length - 1 ? day.total - Math.round(day.total * parts[0]) - Math.round(day.total * parts[1]) : Math.round(day.total * portion)
      const hour24 = 9 + (daySeed % 6) + index * 2
      const hour12 = ((hour24 + 11) % 12) + 1
      return { id: String(420 + ((daySeed * 3 + index) % 57)), time: `${hour12}:${index === 0 ? "15" : index === 1 ? "35" : "50"} ${hour24 >= 12 ? "PM" : "AM"}`, service: index === 1 ? t("delivery") : `${t("table")} ${String((daySeed + index) % 8 + 1).padStart(2, "0")}`, total, paid: (daySeed + index) % 3 !== 0 }
    })
  }, [day, t])
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", onKey) }
  }, [onClose])
  const closeAfterSwipe = (end: number) => {
    if (touchStart !== null && end - touchStart > 90) onClose()
    setTouchStart(null)
  }
  const locale = localeFor(lang)
  const paidTotal = day.paid
  const pendingTotal = day.pending

  return createPortal(<div className="day-sheet-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className="day-sheet" role="dialog" aria-modal="true" aria-labelledby="day-sheet-title" onTouchStart={(event) => setTouchStart(event.touches[0]?.clientY ?? null)} onTouchEnd={(event) => closeAfterSwipe(event.changedTouches[0]?.clientY ?? 0)}>
      <div className="sheet-handle" aria-hidden="true"><span /></div>
      <header className="day-sheet-header"><h2 id="day-sheet-title">{formatDay(day.date, locale)}</h2><button className="icon-button" type="button" onClick={onClose} aria-label={t("close")}><X size={18} /></button></header>
      <div className="day-sheet-body">
        <div className="sheet-day-total"><span>{t("total")}</span><strong><small>ETB</small> {currencyValue(day.total, lang)}</strong></div>
        <div className="sheet-metrics"><div><span>{t("paidSales")}</span><strong><small>ETB</small> {currencyValue(paidTotal, lang)}</strong></div><div><span>{t("pendingSales")}</span><strong><small>ETB</small> {currencyValue(pendingTotal, lang)}</strong></div></div>
        <div className="sheet-channel-split"><div><span>{t("inCafe")}</span><strong><small>ETB</small> {currencyValue(day.cafe, lang)}</strong><i className="legend-orange" /></div><div><span>{t("delivery")}</span><strong><small>ETB</small> {currencyValue(day.delivery, lang)}</strong><i className="legend-blue" /></div></div>
        <div className="sheet-orders-heading"><h3>{t("orders")}</h3><span>{orders.length}</span></div>
        <div className="sheet-orders">{orders.map((order, index) => <article className="sheet-order stagger-in" key={`${order.id}-${index}`} style={{ "--stagger-index": index } as CSSProperties}><div className="sheet-order-top"><strong>#{order.id}</strong><span>{order.time}</span><span className={`payment-tag ${order.paid ? "is-paid" : "is-pending"}`}>{order.paid ? t("paid") : t("pendingPayment")}</span></div><div className="sheet-order-bottom"><span>{order.service}</span><strong><small>ETB</small> {currencyValue(order.total, lang)}</strong></div></article>)}</div>
      </div>
    </section>
  </div>, document.body)
}
