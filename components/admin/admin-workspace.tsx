"use client"

import { useEffect, useState, type FormEvent } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowDown, ArrowLeft, ArrowUp, Check, ChevronDown, ChevronUp, CirclePlus, Clock3, FileImage, MapPin, Minus, Plus, ReceiptText, Search, ShoppingBag, UtensilsCrossed, X } from "lucide-react"
import { initialBanners, initialMenu, type Banner, type MenuItem, type MenuOption } from "@/lib/admin-mock"
import { SalesDashboard } from "@/components/admin/sales-dashboard"
import { type Language, type TranslationKey } from "@/data/admin-translations"
import { useAdminLocale } from "@/components/admin/admin-locale"

type OrderItem = { name: string; am?: string; qty: number; price: number; size?: string | null; addons?: string[]; note?: string }
type Order = { id: string; number: number; time: string; type: "cafe" | "delivery"; phone?: string; location?: string; notes?: string; table?: string; customer?: string; items: OrderItem[]; total: number; paid: boolean; status: "pending" | "cooking" | "ready" }
type OrderStatus = "pending" | "cooking" | "ready"

const money = (value: number) => `ETB ${value.toLocaleString()}`
const categoryKeys: Record<string, TranslationKey> = { Burgers: "catBurgers", Pizza: "catPizza", Juices: "catJuices", Shawarma: "catShawarma", Fasting: "catFasting" }
const tabs = [{ href: "/admin", key: "orders" as const, icon: ReceiptText }, { href: "/admin/sales", key: "sales" as const, icon: ShoppingBag }, { href: "/admin/menu", key: "menu" as const, icon: UtensilsCrossed }, { href: "/admin/banner", key: "banner" as const, icon: FileImage }]
const statuses: { value: OrderStatus; am: string; en: string }[] = [{ value: "pending", am: "በመጠባበቅ ላይ", en: "Pending" }, { value: "cooking", am: "እየተዘጋጀ ነው", en: "Preparing" }, { value: "ready", am: "ተዘጋጅቷል", en: "Ready" }]

function mapRow(row: any): Order {
  return {
    id: row.id,
    number: row.daily_number,
    time: new Date(row.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    type: row.channel === "delivery" ? "delivery" : "cafe",
    phone: row.delivery_phone ?? undefined,
    location: row.delivery_location ?? undefined,
    notes: row.notes ?? undefined,
    table: row.table_number ?? undefined,
    items: (row.items || []).map((i: any) => ({ name: i.name, am: i.name_am, qty: i.quantity, price: i.unit_price, size: i.size, addons: i.add_ons, note: i.note })),
    total: row.total,
    paid: row.paid,
    status: row.status,
  }
}

export function AdminWorkspace() {
  const pathname = usePathname()
  const { language: lang, setLanguage: setLang, t, categories, setCategories } = useAdminLocale()
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [menu, setMenu] = useState<MenuItem[]>(initialMenu)
  const [sizes, setSizes] = useState<MenuOption[]>([])
  const [addons, setAddons] = useState<MenuOption[]>([])
  const [selectedCategory, setSelectedCategory] = useState("Burgers")
  const [menuType, setMenuType] = useState<"fasting" | "non-fasting">("non-fasting")
  const [menuFilter, setMenuFilter] = useState<"all" | "fasting" | "non-fasting">("all")
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [categoryDialog, setCategoryDialog] = useState(false)
  const [categoryError, setCategoryError] = useState(false)
  const [banners, setBanners] = useState<Banner[]>(initialBanners)
  const [orderType, setOrderType] = useState<"cafe" | "delivery">("cafe")
  const [expanded, setExpanded] = useState<string[]>([])
  const [modal, setModal] = useState<"delivery" | "menu" | "banner" | null>(null)
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ kind: "menu" | "banner"; id: number } | null>(null)
  const [formError, setFormError] = useState("")
  const [search, setSearch] = useState("")
  const [counts, setCounts] = useState<Record<number, number>>({})
  const [manualTotal, setManualTotal] = useState<number | null>(null)
  const [toast, setToast] = useState("")
  const subtotal = menu.reduce((sum, item) => sum + item.price * (counts[item.id] || 0), 0)
  const route = pathname.endsWith("/sales") ? "sales" : pathname.endsWith("/menu") ? "menu" : pathname.endsWith("/banner") ? "banner" : "orders"

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders", { cache: "no-store" })
      if (!res.ok) throw new Error("fail")
      const data = await res.json()
      setOrders(data.map(mapRow))
      setOrdersError(false)
      setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }))
    } catch {
      setOrdersError(true)
    } finally {
      setOrdersLoading(false)
    }
  }

  useEffect(() => {
    if (route !== "orders") return
    fetchOrders()
    let interval: any = null
    const start = () => { if (interval) return; interval = setInterval(() => { if (document.visibilityState === "visible") fetchOrders() }, 5000) }
    const stop = () => { if (interval) { clearInterval(interval); interval = null } }
    const onVis = () => { if (document.visibilityState === "visible") fetchOrders() }
    start()
    document.addEventListener("visibilitychange", onVis)
    return () => { stop(); document.removeEventListener("visibilitychange", onVis) }
  }, [route])

  const activeOrders = orders.filter(o => o.type === orderType && o.status !== "ready").sort((a,b) => a.number - b.number)
  const readyOrders = orders.filter(o => o.type === orderType && o.status === "ready").sort((a,b) => a.number - b.number)

  const toggle = (list: string[], id: string, setter: (value: string[]) => void) => setter(list.includes(id) ? list.filter(x => x !== id) : [...list, id])
  const patchOrder = (id: string, change: Partial<Order>) => setOrders(prev => prev.map(o => o.id === id ? { ...o, ...change } : o))

  const onPay = async (order: Order) => {
    const newPaid = !order.paid
    patchOrder(order.id, { paid: newPaid })
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/paid`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paid: newPaid }) })
      if (!res.ok) throw new Error("fail")
    } catch {
      patchOrder(order.id, { paid: order.paid })
      setToast("Update failed")
      setTimeout(() => setToast(""), 2500)
    }
  }
  const onStatus = async (order: Order, status: OrderStatus) => {
    const prev = order.status
    patchOrder(order.id, { status })
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) })
      if (!res.ok) throw new Error("fail")
    } catch {
      patchOrder(order.id, { status: prev })
      setToast("Update failed")
      setTimeout(() => setToast(""), 2500)
    }
  }

  const title = t(route as TranslationKey)
  const submitDelivery = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const phone = String(form.get("phone") || "").trim(), location = String(form.get("location") || "").trim()
    const items = menu.filter(item => (counts[item.id] || 0) > 0).map(item => ({ name: item.name, am: item.am, qty: counts[item.id], price: item.price }))
    if (!phone || !location || !items.length) { setFormError(!phone || !location ? t("required") : t("minItem")); return }
    const totalField = form.get("total")
    const total = totalField === null ? items.reduce((sum, item) => sum + (item.price || 0) * item.qty, 0) : Math.max(0, Number(totalField) || 0)
    setOrders(prev => {
      const id = String(Math.max(0, ...prev.map(order => Number(order.id) || 0)) + 1).padStart(3, "0")
      return [{ id, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), type: "delivery", phone, location, notes: String(form.get("notes") || ""), items, total, paid: false, status: "pending" }, ...prev]
    })
    setCounts({}); setFormError(""); setModal(null)
  }
  const closeModal = () => { setModal(null); setFormError(""); setEditingMenu(null); setEditingBanner(null) }
  const saveMenu = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const entry = { id: editingMenu?.id || Date.now(), name: String(form.get("name") || "New menu item"), am: String(form.get("am") || ""), category: String(form.get("category") || categories[0]?.name || "Burgers"), price: Number(form.get("price")) || 0, type: menuType, available: editingMenu?.available ?? true, sizes, addons }
    setMenu(prev => editingMenu ? prev.map(i=>i.id===editingMenu.id ? entry : i) : [entry, ...prev]); closeModal()
  }
  const saveBanner = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const entry: Banner = { id: editingBanner?.id || Date.now(), title: String(form.get("title") || "A little joy in every bite"), am: String(form.get("am") || ""), from: String(form.get("from") || "") || undefined, until: String(form.get("until") || "") || undefined, active: form.get("active") === "on", color: editingBanner?.color || "#f5e3d3" }
    setBanners(prev => editingBanner ? prev.map(b=>b.id===editingBanner.id ? entry : b) : [...prev, entry]); closeModal()
  }

  return <div className="admin-shell" lang={lang}>
    <header className="topbar"><div className={`language language-${lang}`} role="group" aria-label={t("language")}><span className="segment-pill" aria-hidden="true"/><button type="button" className={lang === "en" ? "selected" : ""} aria-pressed={lang === "en"} onClick={() => setLang("en")}>{lang === "en" && <Check size={12}/>}EN</button><button type="button" className={lang === "am" ? "selected" : ""} aria-pressed={lang === "am"} onClick={() => setLang("am")}>{lang === "am" && <Check size={12}/>}አማ</button></div></header>
    <main className="admin-main"><div className="page-heading"><div className="page-title-row"><h1>{title}</h1>{route === "orders" && <div className="updated">{t("updated")} {lastUpdated}</div>}</div></div>
      {route === "orders" && <section className="route-transition"><div className="orders-toolbar"><div className={`segmented two-segments ${orderType === "delivery" ? "segment-second" : "segment-first"}`} role="group" aria-label={t("orderType")}><span className="segment-pill" aria-hidden="true"/><button type="button" className={orderType === "cafe" ? "active" : ""} aria-pressed={orderType === "cafe"} onClick={() => setOrderType("cafe")}>{orderType === "cafe" && <Check size={12}/ >}{t("inCafe")} <span>{orders.filter(o=>o.type === "cafe" && o.status !== "ready").length}</span></button><button type="button" className={orderType === "delivery" ? "active" : ""} aria-pressed={orderType === "delivery"} onClick={() => setOrderType("delivery")}>{orderType === "delivery" && <Check size={12}/ >}{t("delivery")} <span>{orders.filter(o=>o.type === "delivery" && o.status !== "ready").length}</span></button></div></div>
        {ordersLoading && <div className="order-list"><div className="empty-state"><strong>Loading…</strong></div></div>}
        {ordersError && !ordersLoading && <div className="empty-state"><strong>Failed to load</strong><button className="button subtle" onClick={fetchOrders}>Try again</button></div>}
        {!ordersLoading && !ordersError && activeOrders.length === 0 && readyOrders.length === 0 && <EmptyState text={t("noOrders")} hint={t("emptyOrdersHint")}/>}
        {!ordersLoading && !ordersError && (activeOrders.length > 0 || readyOrders.length > 0) && <div className="order-list">{activeOrders.map(order => <OrderCard key={order.id} order={order} lang={lang} t={t} expanded={expanded.includes(order.id)} onExpand={()=>toggle(expanded,order.id,setExpanded)} onPay={()=>onPay(order)} onStatus={status=>onStatus(order,status)}/>)}</div>}
        {!ordersLoading && !ordersError && readyOrders.length > 0 && <><div className="section-label"><span>{t("readySection").toUpperCase()}</span><span className="label-line"/></div><div className="order-list quiet-list">{readyOrders.map(order=><OrderCard key={order.id} order={order} lang={lang} t={t} expanded={expanded.includes(order.id)} onExpand={()=>toggle(expanded,order.id,setExpanded)} onPay={()=>onPay(order)} onStatus={status=>onStatus(order,status)}/>)}</div></>}
        {toast && <div className="login-notice">{toast}</div>}
      </section>}
      {route === "sales" && <SalesDashboard lang={lang} t={t}/>}
      {route === "menu" && <section className="route-transition"><div className="list-toolbar"><div className="search-field"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t("search")}/></div><button className="button primary" onClick={()=>{setEditingMenu(null);setSelectedCategory(categories[0]?.name||"Burgers");setMenuType("non-fasting");setSizes([]);setAddons([]);setModal("menu")}}><Plus size={17}/>{t("addItem")}</button></div><div className={`menu-filter segmented three-segments ${menuFilter === "all" ? "segment-first" : menuFilter === "fasting" ? "segment-middle" : "segment-last"}`} role="group" aria-label={t("menuFilter")}><span className="segment-pill" aria-hidden="true"/>{(["all","fasting","non-fasting"] as const).map((filter,index)=><button key={filter} type="button" className={menuFilter===filter?"active":""} aria-pressed={menuFilter===filter} onClick={()=>setMenuFilter(filter)}>{menuFilter===filter&&<Check size={12}/ >}{t(filter === "all" ? "all" : filter === "fasting" ? "fasting" : "nonFasting")}</button>)}</div><div className="menu-list">{menu.filter(item=>item.name.toLowerCase().includes(search.toLowerCase())&&(menuFilter === "all" || item.type === menuFilter)).map(item=><div className={`menu-row ${!item.available?"unavailable":""}`} key={item.id}><div className="food-thumb"><FileImage size={18} aria-hidden="true"/></div><div className="menu-info"><strong>{lang === "am" && item.am ? item.am : item.name}</strong><span>{categoryKeys[item.category] ? t(categoryKeys[item.category]) : item.category} · {money(item.price)}{item.type === "fasting" && <em className="fasting-tag">{t("fasting")}</em>}</span>{!item.available && <em>{t("hidden")}</em>}</div><label className="switch-label" aria-label={t("available")}><input type="checkbox" checked={item.available} onChange={()=>setMenu(prev=>prev.map(i=>i.id===item.id?{...i,available:!i.available}:i))}/><span className="switch-track"/></label><button className="button subtle row-edit" aria-label={t("edit")} onClick={()=>{setEditingMenu(item);setSelectedCategory(item.category);setMenuType(item.type);setSizes(item.sizes||[]);setAddons(item.addons||[]);setModal("menu")}}>{t("edit")}</button></div>)}</div></section>}
      {route === "banner" && <BannerPage banners={banners} lang={lang} t={t} setBanners={setBanners} onAdd={()=>{setEditingBanner(null);setModal("banner")}} onEdit={b=>{setEditingBanner(b);setModal("banner")}} onDelete={id=>setDeleteConfirm({kind:"banner",id})}/>}
    </main>
    <nav className="bottom-nav" aria-label={t("adminNavigation")}>{tabs.map(({href,key,icon:Icon})=><Link key={href} href={href} className={route===key?"nav-item active":"nav-item"}><Icon size={19} strokeWidth={route===key?2.2:1.7}/><span>{t(key)}</span></Link>)}</nav>
    {modal && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)closeModal()}}><div className="modal-panel"><div className="modal-header"><div><span className="eyebrow">BILSHAKE / {t(route as TranslationKey).toUpperCase()}</span><h2>{modal === "delivery" ? t("newOrder") : modal === "menu" ? (editingMenu ? t("edit") : t("addItem")) : (editingBanner ? t("edit") : t("addBanner"))}</h2></div><button className="icon-button" onClick={closeModal} aria-label={t("cancel")}><X size={19}/></button></div>
      {modal === "delivery" && <form onSubmit={submitDelivery} onChange={() => formError && setFormError("")} className="form-content"><div className="form-grid"><label>{t("phone")} *<input name="phone" type="tel" placeholder="+251 9..."/></label><label>{t("location")} *<input name="location" placeholder={t("locationExample")}/></label></div><div className="field-title">{t("selectItems")} *</div><div className="pick-list" onClick={() => formError && setFormError("")}>{menu.filter(i=>i.available).map(item=><div className="pick-row" key={item.id}><span>{lang === "am" && item.am ? item.am : item.name}<small>{money(item.price)}</small></span><div className="quantity"><button type="button" aria-label={t("decrease")} onClick={()=>{setCounts({...counts,[item.id]:Math.max(0,(counts[item.id]||0)-1)});setManualTotal(null)}}><Minus size={15}/></button><b>{counts[item.id]||0}</b><button type="button" aria-label={t("increase")} onClick={()=>{setCounts({...counts,[item.id]:(counts[item.id]||0)+1});setManualTotal(null)}}><Plus size={15}/></button></div></div>)}</div><label>{t("notes")}<textarea name="notes" rows={2} placeholder={t("notesPlaceholder")}/></label><label>{t("total")} · ETB<input name="total" type="number" min="0" value={manualTotal ?? subtotal} onChange={e=>setManualTotal(Number(e.target.value))} /></label>{formError&&<p className="form-error" role="alert">{formError}</p>}<div className="modal-actions"><button type="button" className="button subtle" onClick={closeModal}>{t("cancel")}</button><button className="button primary" type="submit">{t("save")}</button></div></form>}
      {modal === "menu" && <form onSubmit={saveMenu} className="form-content"><div className="photo-upload"><FileImage size={21}/><span>{t("uploadPhoto")}</span><input type="file" accept="image/*" aria-label={t("uploadPhoto")}/></div><label>{t("englishName")} *<input name="name" required defaultValue={editingMenu?.name}/></label><label>{t("amharicName")}<input name="am" defaultValue={editingMenu?.am}/></label><div className="form-grid menu-form-grid"><CategoryPicker categories={categories} value={selectedCategory} lang={lang} t={t} onChange={setSelectedCategory} onAdd={()=>{setCategoryError(false);setCategoryDialog(true)}}/><input type="hidden" name="category" value={selectedCategory}/><label>{t("price")} · ETB<input className="field-control" name="price" type="number" min="0" required defaultValue={editingMenu?.price}/></label></div><fieldset className="type-field"><legend>{t("type")}</legend><div className={`segmented two-segments ${menuType === "fasting" ? "segment-first" : "segment-second"}`} role="group" aria-label={t("type")}><span className="segment-pill" aria-hidden="true"/><button type="button" className={menuType === "fasting" ? "active" : ""} aria-pressed={menuType === "fasting"} onClick={()=>setMenuType("fasting")}>{menuType === "fasting"&&<Check size={12}/ >}{t("fasting")}</button><button type="button" className={menuType === "non-fasting" ? "active" : ""} aria-pressed={menuType === "non-fasting"} onClick={()=>setMenuType("non-fasting")}>{menuType === "non-fasting"&&<Check size={12}/ >}{t("nonFasting")}</button></div></fieldset><OptionSection title={t("sizesTitle")} entries={sizes} setEntries={setSizes} t={t}/><OptionSection title={t("addonsTitle")} entries={addons} setEntries={setAddons} t={t}/>{editingMenu&&<button type="button" className="delete-link" onClick={()=>setDeleteConfirm({kind:"menu",id:editingMenu.id})}>{t("delete")}</button>}<div className="modal-actions"><button type="button" className="button subtle" onClick={closeModal}>{t("cancel")}</button><button className="button primary" type="submit">{t("saveChanges")}</button></div></form>}
      {modal === "banner" && <form onSubmit={saveBanner} className="form-content"><div className="photo-upload"><FileImage size={21}/><span>{t("uploadPhoto")}</span><input type="file" accept="image/*" aria-label={t("uploadPhoto")}/></div><label>{t("englishText")} *<textarea name="title" rows={2} defaultValue={editingBanner?.title}/></label><label>{t("amharicText")}<textarea name="am" rows={2} defaultValue={editingBanner?.am}/></label><div className="form-grid"><label>{t("showFrom")}<input type="date" name="from" defaultValue={editingBanner?.from}/></label><label>{t("hideAfter")}<input type="date" name="until" defaultValue={editingBanner?.until}/></label></div><label className="check-row"><input type="checkbox" name="active" defaultChecked={editingBanner?.active??true}/>{t("available")}</label><div className="modal-actions"><button type="button" className="button subtle" onClick={closeModal}>{t("cancel")}</button><button className="button primary" type="submit">{t("saveChanges")}</button></div></form>}
    </div></div>}
    {categoryDialog&&<div className="mini-modal-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)setCategoryDialog(false)}}><form className="mini-modal" onSubmit={event=>{event.preventDefault();const data=new FormData(event.currentTarget);const name=String(data.get("categoryName")||"").trim();if(!name){setCategoryError(true);return}const am=String(data.get("categoryAm")||"").trim();setCategories(current=>[...current,{name,am}]);setSelectedCategory(name);setCategoryDialog(false)}}><h3>{t("addCategory")}</h3><label>{t("categoryEnglish")}<input autoFocus name="categoryName" onChange={()=>setCategoryError(false)}/></label>{categoryError&&<p className="form-error" role="alert">{t("nameRequired")}</p>}<label>{t("categoryAmharic")}<input name="categoryAm"/></label><div className="modal-actions"><button type="button" className="button subtle" onClick={()=>setCategoryDialog(false)}>{t("cancel")}</button><button className="button primary" type="submit">{t("add")}</button></div></form></div>}
    {deleteConfirm !== null && <div className="modal-backdrop"><div className="confirm-box" role="alertdialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-description"><h2 id="delete-title">{t("areYouSure")}</h2><p id="delete-description">{deleteConfirm.kind === "banner" ? t("deleteBannerPrompt") : t("deleteItemPrompt")}</p><div className="modal-actions"><button className="button subtle" type="button" onClick={()=>setDeleteConfirm(null)}>{t("cancel")}</button><button className="button danger" type="button" onClick={()=>{if(deleteConfirm.kind === "menu") setMenu(prev=>prev.filter(i=>i.id!==deleteConfirm.id)); else setBanners(prev=>prev.filter(b=>b.id!==deleteConfirm.id));setDeleteConfirm(null);closeModal()}}>{t(deleteConfirm.kind === "banner" ? "deleteBanner" : "delete")}</button></div></div></div>}
  </div>
}
function OrderCard({order,lang,t,expanded,onExpand,onPay,onStatus}:{order:Order;lang:Language;t:(key:TranslationKey)=>string;expanded:boolean;onExpand:()=>void;onPay:()=>void;onStatus:(status:OrderStatus)=>void}) {
  return <article className={`order-card ${order.status === "ready"?"order-ready":""}`}><div className="order-top"><div className="order-number"><strong>#{order.number}</strong><span><Clock3 size={13}/>{order.time}</span></div><button className={`payment-tag ${order.paid?"is-paid":"is-pending"}`} onClick={onPay} aria-label={`${order.paid?t("paid"):t("pendingPayment")}. ${t("tapToChange")}. `}>{order.paid&&<Check size={13}/ >}{order.paid?t("paid"):t("pendingPayment")}</button></div><div className="order-meta">{order.type === "delivery" ? <><span><MapPin size={14}/>{order.location}</span><span>{order.phone}</span></> : order.table && <span className="table-tag">{t("table")} {order.table}</span>}</div><div className="order-items">{order.items.map((item,i)=><div key={`${item.name}-${i}`}><span><b>{item.qty}×</b> {lang === "am" && item.am ? item.am : item.name}</span><strong>{money(item.qty * (item.price ?? 0))}</strong></div>)}</div><div className="order-total"><span>{t("total")}</span><strong>{money(order.total)}</strong></div><button className="details-button" onClick={onExpand}>{expanded?t("hideDetails"):t("details")}{expanded?<ChevronUp size={15}/>:<ChevronDown size={15}/>}</button>{expanded&&<div className="order-extra">{order.phone&&order.type==="delivery"&&<p><span>{t("phone")}</span>{order.phone}</p>}{order.location&&order.type==="delivery"&&<p><span>{t("location")}</span>{order.location}</p>}{order.notes&&<p><span>{t("notes")}</span>{order.notes}</p>}{order.items.map(i=><p key={i.name}><span>{i.name}</span>{[i.size,...(i.addons||[])].filter(Boolean).join(" · ")}</p>)}</div>}<div className="status-controls">{statuses.map(s=><button key={s.value} className={`status-button status-${s.value} ${order.status===s.value?"chosen":""}`} onClick={()=>onStatus(s.value)} aria-pressed={order.status===s.value}><span lang="am">{s.am}</span><small>{s.en}</small>{s.value==="ready"&&<Check className="status-check" size={14}/>}</button>)}</div></article>
}
function EmptyState({text,hint}:{text:string;hint:string}) { return <div className="empty-state"><div className="empty-icon"><ReceiptText size={22}/></div><strong>{text}</strong><span>{hint}</span></div> }
function formatBannerDate(value: string, lang: Language) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return value
  return new Intl.DateTimeFormat(lang === "am" ? "am-ET" : "en-GB", { day: "numeric", month: "short" }).format(new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
}
function BannerPage({banners,lang,t,setBanners,onAdd,onEdit,onDelete}:{banners:Banner[];lang:Language;t:(key:TranslationKey)=>string;setBanners:(banners:Banner[])=>void;onAdd:()=>void;onEdit:(banner:Banner)=>void;onDelete:(id:number)=>void}) {
  const active = banners.filter(b=>b.active), [slide,setSlide] = useState(0)
  useEffect(() => {
    if (active.length < 2) return
    const interval = window.setInterval(() => setSlide(current => (current + 1) % active.length), 5000)
    return () => window.clearInterval(interval)
  }, [active.length])
  return <section className="banner-content route-transition"><div className="banner-preview" style={{backgroundColor:active[slide%Math.max(1,active.length)]?.color||"#f4f1ed"}}><span className="preview-eyebrow">BILSHAKE · {t("restaurant")}</span><strong>{active.length ? (lang === "am" ? active[slide%active.length]?.am : active[slide%active.length]?.title) : t("noActiveBanner")}</strong><span className="preview-sub">{t("lightMeal")}</span><div className="preview-dots">{active.map((b,i)=><button key={b.id} aria-label={`${t("showBanner")} ${i+1}`} onClick={()=>setSlide(i)} className={slide%Math.max(1,active.length)===i?"active":""}/>)}</div></div><div className="banner-toolbar"><div><h2>{t("banner")} <span>{banners.length} {t("of")} 5</span></h2><p>{active.length} {t("activeBanners")}</p></div><button disabled={banners.length>=5} className="button primary" onClick={onAdd}><Plus size={17}/>{t("addBanner")}</button></div><div className="banner-list">{banners.map((banner,i)=><div className="banner-row" key={banner.id}><div className="banner-thumb" style={{backgroundColor:banner.color}}><span>{lang==="am"?banner.am:banner.title}</span></div><div className="banner-info"><strong>{lang === "am"?banner.am:banner.title}</strong><span>{banner.from && `${t("from")} ${formatBannerDate(banner.from,lang)} · `}{banner.until?`${t("till")} ${formatBannerDate(banner.until,lang)}`:t("available")}</span></div><label className="switch-label" aria-label={t("available")}><input type="checkbox" checked={banner.active} onChange={()=>setBanners(banners.map(b=>b.id===banner.id?{...b,active:!b.active}:b))}/><span className="switch-track"/></label><div className="reorder"><button aria-label={t("moveUp")} disabled={i===0} onClick={()=>{const arr=[...banners];[arr[i-1],arr[i]]=[arr[i],arr[i-1]];setBanners(arr)}}><ArrowUp size={15}/></button><button aria-label={t("moveDown")} disabled={i===banners.length-1} onClick={()=>{const arr=[...banners];[arr[i+1],arr[i]]=[arr[i],arr[i+1]];setBanners(arr)}}><ArrowDown size={15}/></button></div><button className="button subtle row-edit" onClick={()=>onEdit(banner)} aria-label={t("edit")}>{t("edit")}</button><button className="icon-button muted-icon" onClick={()=>onDelete(banner.id)} aria-label={t("deleteBanner")}><X size={17}/></button></div>)}</div><p className="banner-footnote">{t("bannerRotationNotice")}</p></section>
}
