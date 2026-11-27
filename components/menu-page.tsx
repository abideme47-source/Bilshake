'use client'

import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowLeft, Check, Plus, Phone } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { categories, type MenuType } from '@/data/categories'
import { menuItems, type MenuItem } from '@/data/menu'
import { settings } from '@/data/settings'
import { useCartActions, useCartCount } from '@/lib/cart'
import { useLanguage } from '@/lib/language'
import { HistoryBackLink } from '@/components/history-back-link'

const ease = [0.22, 1, 0.36, 1] as const
const MotionLink = motion.create(Link)
const menuGridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
}
const menuCardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.36, ease } },
}

type FastingFilter = 'all' | 'fasting' | 'non-fasting'

function formatPrice(amount: number, currency = 'Birr') {
  return `${amount.toLocaleString('en-US')} ${currency}`
}

export function BottomDock({ home = false }: { home?: boolean }) {
  const count = useCartCount()
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
            prefetch
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
  const { text } = useLanguage()
  const coverRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const [measurements, setMeasurements] = useState({ coverWidth: 430, titleWidth: 0, titleTargetX: 68 })
  const blurOpacity = useTransform(scrollY, [0, 148], [0, 1])
  const titleX = useTransform(scrollY, [0, 148], [-measurements.titleWidth / 2, measurements.titleTargetX - measurements.coverWidth / 2])
  const titleY = useTransform(scrollY, [0, 148], [75, 0])
  const titleScale = useTransform(scrollY, [0, 148], [1, 0.6])
  const clipPath = useTransform(scrollY, [0, 148], ['inset(0px 0px 0px 0px round 0px 0px 28px 28px)', 'inset(0px 0px 148px 0px round 0px 0px 0px 0px)'])
  const title = type === 'food' ? text('Food') : text('Drink')
  const cover = type === 'food' ? settings.foodCoverImage : settings.drinkCoverImage

  useEffect(() => {
    const cover = coverRef.current
    const title = titleRef.current
    const backButton = cover?.querySelector('.menu-back-button')
    if (!cover || !title || !backButton) return
    const observer = new ResizeObserver(() => {
      const coverBounds = cover.getBoundingClientRect()
      const titleBounds = title.getBoundingClientRect()
      const backBounds = backButton.getBoundingClientRect()
      setMeasurements({ coverWidth: coverBounds.width, titleWidth: titleBounds.width, titleTargetX: backBounds.right - coverBounds.left + 12 })
    })
    observer.observe(cover)
    observer.observe(title)
    observer.observe(backButton)
    return () => observer.disconnect()
  }, [title])

  return <motion.div ref={coverRef} className="menu-cover" style={{ clipPath }}>
    <Image className="menu-cover-photo" src={cover} alt="" aria-hidden="true" fill sizes="(max-width: 430px) 100vw, 430px" priority />
    <motion.div className="menu-cover-blur-layer" style={{ opacity: blurOpacity }} aria-hidden="true"><Image className="menu-cover-photo menu-cover-blur" src={cover} alt="" fill sizes="(max-width: 430px) 100vw, 430px" priority /></motion.div>
    <div className="menu-cover-shade" aria-hidden="true" />
    <HistoryBackLink href="/" className="menu-back-button" ariaLabel={text('Back to home')}><ArrowLeft size={20} strokeWidth={2.2} /></HistoryBackLink>
    <motion.h1 ref={titleRef} style={{ x: titleX, y: titleY, scale: titleScale }}>{title}</motion.h1>
  </motion.div>
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
          transition={{ duration: reducedMotion ? 0 : 0.15, ease }}
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

const ItemCard = memo(function ItemCard({ item }: { item: MenuItem }) {
  const { text, language } = useLanguage()
  const router = useRouter()
  const { addItem } = useCartActions()
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
      variants={menuCardVariants}
      onClick={!item.available ? notifyUnavailable : undefined}
    >
      <Link
        href={href}
        prefetch
        className="menu-item-link"
        aria-label={`${itemLabel}, ${formatPrice(item.price, text('Birr'))}`}
        onClick={!item.available ? (event) => { event.preventDefault(); notifyUnavailable() } : undefined}
      >
        <span className="menu-item-visual">
          <span className="menu-item-image-wrap">
            <Image className="menu-item-image" src={item.imageUrl} alt="" fill sizes="(max-width: 430px) 50vw, 215px" loading="lazy" />
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
          aria-label={added ? `${itemLabel} ${text('Added')}` : `${text('Add to plate')}: ${itemLabel}`}
        />
      )}
      {!item.available && (
        <AnimatePresence>
          {showUnavailable && <motion.p className="unavailable-message menu-unavailable-message" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>{text("This item isn't available for now")}</motion.p>}
        </AnimatePresence>
      )}
    </motion.article>
  )
})

export function MenuPage({ type, categories: catProp, items: itemsProp }: { type: MenuType; categories?: typeof categories; items?: typeof menuItems }) {
  const { text } = useLanguage()
  const [filter, setFilter] = useState<FastingFilter>('all')
  const [categoryId, setCategoryId] = useState('all')
  const reducedMotion = useReducedMotion()
  const title = type === 'food' ? text('Food') : text('Drink')
  const allCategories = catProp ?? categories
  const allItems = itemsProp ?? menuItems

  const filteredByType = useMemo(() => allItems.filter((item) => item.type === type), [type, allItems])
  const dietaryItems = useMemo(() => filteredByType.filter((item) => (
    filter === 'all' || item.fasting === (filter === 'fasting')
  )), [filteredByType, filter])
  const availableCategories = useMemo(() => allCategories.filter((category) => (
    category.type === type && dietaryItems.some((item) => item.categoryId === category.id)
  )), [dietaryItems, type, allCategories])
  const visibleItems = useMemo(() => dietaryItems.filter((item) => (
    categoryId === 'all' || item.categoryId === categoryId
  )), [categoryId, dietaryItems])

  function changeFilter(nextFilter: FastingFilter) {
    setFilter(nextFilter)
    setCategoryId('all')
  }

  return (
    <main className="menu-shell">
      <MenuCover type={type} />
      <div className="menu-cover-spacer" aria-hidden="true" />
      <MenuFilters
        type={type}
        filter={filter}
        categoryId={categoryId}
        availableCategories={availableCategories}
        onFilterChange={changeFilter}
        onCategoryChange={setCategoryId}
      />
      <div className="menu-page-content">
        <h2 className="sr-only">{title} {text('menu')}</h2>
        <motion.div
          key={`${filter}-${categoryId}`}
          className="menu-item-grid"
          variants={menuGridVariants}
          initial={reducedMotion ? false : 'hidden'}
          animate="visible"
        >
          {visibleItems.map((item) => <ItemCard key={item.id} item={item} />)}
        </motion.div>
      </div>
      <BottomDock />
    </main>
  )
}
