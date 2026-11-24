'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowLeft, Check, Plus, Phone } from 'lucide-react'
import Link from 'next/link'
import { categories, type MenuType } from '@/data/categories'
import { menuItems, type MenuItem } from '@/data/menu'
import { settings } from '@/data/settings'
import { useCart } from '@/lib/cart'
import { useLanguage } from '@/lib/language'

const ease = [0.22, 1, 0.36, 1] as const
const MotionLink = motion.create(Link)

type FastingFilter = 'all' | 'fasting' | 'non-fasting'

function formatPrice(amount: number, currency = 'Birr') {
  return `${amount.toLocaleString('en-US')} ${currency}`
}

export function BottomDock({ home = false }: { home?: boolean }) {
  const { count } = useCart()
  const { text } = useLanguage()
  const reducedMotion = useReducedMotion()
  const showOrder = !home && count > 0

  return (
    <div className="bottom-call-wrap menu-call-wrap">
      <a className={`call-button${showOrder ? ' has-cart' : ' call-only'}`} href={settings.phoneHref} aria-label={text('Call to order')}>
        <span className="phone-mark" aria-hidden="true"><Phone size={17} strokeWidth={2.1} /></span>
        {!showOrder && <span className="call-copy">{text('Call to order')}</span>}
      </a>
      <AnimatePresence>
        {showOrder && (
          <MotionLink
            href="/order"
            className="cart-order-bar"
            aria-label={`${text('Order now')}, ${count} ${text('items')}`}
            initial={reducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: 12 }}
            transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 360, damping: 28 }}
          >
            <span>{text('Order now')}</span>
            <span className="cart-count-badge" aria-label={`${count} ${text('items')}`}>{count}</span>
          </MotionLink>
        )}
      </AnimatePresence>
    </div>
  )
}

function MenuCover({ type }: { type: MenuType }) {
  const { scrollY } = useScroll()
  useEffect(() => {
    const updateScroll = () => scrollY.set(window.scrollY)
    updateScroll()
    window.addEventListener('scroll', updateScroll, { passive: true })
    return () => window.removeEventListener('scroll', updateScroll)
  }, [scrollY])
  const { text } = useLanguage()
  const reducedMotion = useReducedMotion()
  const height = useTransform(scrollY, [0, 120], [220, 72])
  const blur = useTransform(scrollY, [0, 120], ['blur(0px)', 'blur(8px)'])
  const radius = useTransform(scrollY, [0, 120], ['0px 0px 28px 28px', '0px 0px 0px 0px'] )
  const coverWidth = typeof window === 'undefined' ? 430 : Math.min(window.innerWidth, 430)
  const titleLeft = useTransform(scrollY, [0, 120], [coverWidth / 2, 68])
  const titleTop = useTransform(scrollY, [0, 120], [110, 15])
  const titleX = useTransform(scrollY, [0, 120], ['-50%', '0%'])
  const titleY = useTransform(scrollY, [0, 120], ['-50%', '0%'])
  const titleSize = useTransform(scrollY, [0, 120], ['40px', '24px'])
  const title = type === 'food' ? text('Food') : text('Drink')
  const cover = type === 'food' ? settings.foodCoverImage : settings.drinkCoverImage

  return (
      <motion.div className="menu-cover" style={{ height, borderRadius: radius }}>
        <motion.img src={cover} alt="" aria-hidden="true" style={{ filter: reducedMotion ? 'blur(0px)' : blur }} />
        <div className="menu-cover-shade" aria-hidden="true" />
        <Link href="/" className="menu-back-button" aria-label={text('Back to home')}>
          <ArrowLeft size={20} strokeWidth={2.2} />
        </Link>
        <motion.h1 style={{ left: titleLeft, top: titleTop, x: titleX, y: titleY, fontSize: titleSize }}>{title}</motion.h1>
      </motion.div>
  )
}

function MenuFilters({
  type,
  filter,
  categoryId,
  availableCategories,
  onFilterChange,
  onCategoryChange,
}: {
  type: MenuType
  filter: FastingFilter
  categoryId: string
  availableCategories: typeof categories
  onFilterChange: (value: FastingFilter) => void
  onCategoryChange: (value: string) => void
}) {
  const { text, language } = useLanguage()
  const choices: { value: FastingFilter; label: string }[] = [
    { value: 'all', label: text('All') },
    { value: 'fasting', label: text('Fasting') },
    { value: 'non-fasting', label: text('Non fasting') },
  ]
  const selectedIndex = choices.findIndex((choice) => choice.value === filter)
  const reducedMotion = useReducedMotion()

  return (
    <div className="menu-filters">
      <div className="menu-segmented" role="group" aria-label={text('Dietary filter')}>
        <motion.span
          className="menu-segment-highlight"
          animate={{ x: `${selectedIndex * 100}%` }}
          transition={{ duration: reducedMotion ? 0 : 0.42, ease }}
          aria-hidden="true"
        />
        {choices.map((choice) => (
          <button key={choice.value} type="button" aria-pressed={filter === choice.value} onClick={() => onFilterChange(choice.value)}>
            {choice.label}
          </button>
        ))}
      </div>
      <div className="menu-category-scroll" role="group" aria-label={text('Categories')}>
        <button type="button" className={`menu-chip${categoryId === 'all' ? ' active' : ''}`} aria-pressed={categoryId === 'all'} onClick={() => onCategoryChange('all')}>
          {text('All')}
        </button>
        {availableCategories.map((category) => (
          <button
            key={category.id}
            type="button"
            className={`menu-chip${categoryId === category.id ? ' active' : ''}`}
            aria-pressed={categoryId === category.id}
            onClick={() => onCategoryChange(category.id)}
          >
            {language === 'am' && category.nameAm ? category.nameAm : category.nameEn}
          </button>
        ))}
      </div>
    </div>
  )
}

function ItemCard({ item, index }: { item: MenuItem; index: number }) {
  const { text, language } = useLanguage()
  const router = useRouter()
  const { addItem } = useCart()
  const reducedMotion = useReducedMotion()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [added, setAdded] = useState(false)
  const [showUnavailable, setShowUnavailable] = useState(false)
  const itemLabel = language === 'am' && item.nameAm ? item.nameAm : item.nameEn
  const hasOptions = Boolean(item.sizes?.length || item.addOns?.length)
  const unavailableTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (unavailableTimerRef.current) clearTimeout(unavailableTimerRef.current)
  }, [])

  function notifyUnavailable() {
    setShowUnavailable(true)
    if (unavailableTimerRef.current) clearTimeout(unavailableTimerRef.current)
    unavailableTimerRef.current = setTimeout(() => setShowUnavailable(false), 2000)
  }
  const href = `/item/${item.id}`

  function addQuickly() {
    if (!item.available) {
      notifyUnavailable()
      return
    }
    if (hasOptions) {
      router.push(href)
      return
    }
    addItem({ id: item.id, size: null, addOns: [], note: '', quantity: 1, unitPrice: item.price })
    setAdded(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setAdded(false), 1100)
  }

  return (
    <motion.article
      className={`menu-item-card${item.available ? '' : ' unavailable'}`}
      initial={reducedMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.48, delay: Math.min(index * 0.035, 0.24), ease }}
      onClick={!item.available ? notifyUnavailable : undefined}
    >
      <Link
        href={href}
        className="menu-item-link"
        aria-label={`${itemLabel}, ${formatPrice(item.price, text('Birr'))}`}
        onClick={!item.available ? (event) => { event.preventDefault(); notifyUnavailable() } : undefined}
      >
        <span className="menu-item-visual">
          <span className="menu-item-image-wrap">
            <img className="menu-item-image" src={item.imageUrl} alt="" loading={index < 4 ? 'eager' : 'lazy'} />
          </span>
          <span className="menu-item-name">{itemLabel}</span>
          <span className="menu-item-price-row">
            <span className="menu-item-price">{formatPrice(item.price, text('Birr'))}</span>
            <motion.span className={`menu-add-button${added ? ' confirmed' : ''}`} aria-hidden="true" whileTap={reducedMotion ? undefined : { scale: 0.9 }}>
              {added ? <Check size={16} strokeWidth={2.6} /> : <Plus size={17} strokeWidth={2.5} />}
            </motion.span>
          </span>
        </span>
      </Link>
      {item.available && (
        <button
          type="button"
          className="menu-add-hit-area"
          onClick={addQuickly}
          aria-label={added ? `${itemLabel} ${text('Added to cart')}` : `${text('Add to cart')}: ${itemLabel}`}
        />
      )}
      {!item.available && (
        <AnimatePresence>
          {showUnavailable && <motion.p className="unavailable-message menu-unavailable-message" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>{text("This item isn't available for now")}</motion.p>}
        </AnimatePresence>
      )}
    </motion.article>
  )
}

export function MenuPage({ type }: { type: MenuType }) {
  const { text } = useLanguage()
  const [filter, setFilter] = useState<FastingFilter>('all')
  const [categoryId, setCategoryId] = useState('all')
  const reducedMotion = useReducedMotion()
  const title = type === 'food' ? text('Food') : text('Drink')

  const filteredByType = useMemo(() => menuItems.filter((item) => item.type === type), [type])
  const dietaryItems = useMemo(() => filteredByType.filter((item) => (
    filter === 'all' || item.fasting === (filter === 'fasting')
  )), [filteredByType, filter])
  const availableCategories = useMemo(() => categories.filter((category) => (
    category.type === type && dietaryItems.some((item) => item.categoryId === category.id)
  )), [dietaryItems, type])
  const visibleItems = useMemo(() => dietaryItems.filter((item) => (
    categoryId === 'all' || item.categoryId === categoryId
  )), [categoryId, dietaryItems])

  function changeFilter(nextFilter: FastingFilter) {
    setFilter(nextFilter)
    setCategoryId('all')
  }

  return (
    <main className="menu-shell">
      <header className="menu-sticky-header">
        <MenuCover type={type} />
        <MenuFilters
          type={type}
          filter={filter}
          categoryId={categoryId}
          availableCategories={availableCategories}
          onFilterChange={changeFilter}
          onCategoryChange={setCategoryId}
        />
      </header>
      <div className="menu-page-content">
        <h2 className="sr-only">{title} {text('menu')}</h2>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${filter}-${categoryId}`}
            className="menu-item-grid"
            initial={reducedMotion ? false : { opacity: 0, y: 7 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: 5 }}
            transition={{ duration: reducedMotion ? 0 : 0.22, ease }}
          >
            {visibleItems.map((item, index) => <ItemCard key={item.id} item={item} index={index} />)}
          </motion.div>
        </AnimatePresence>
      </div>
      <BottomDock />
    </main>
  )
}
