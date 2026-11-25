'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Minus, Plus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { MenuItem, PriceOption } from '@/data/menu'
import { menuItems, popularDrinks } from '@/data/menu'
import { useCart } from '@/lib/cart'
import { useLanguage } from '@/lib/language'

const ease = [0.22, 1, 0.36, 1] as const
const MotionLink = motion.create(Link)

function formatPrice(amount: number, currency = 'Birr') {
  return `${amount.toLocaleString('en-US')} ${currency}`
}

function getDrinkPrice(drink: MenuItem) {
  const defaultSize = drink.sizes?.[0]
  return { size: defaultSize?.label ?? null, price: defaultSize?.price ?? drink.price }
}

export function ItemDetail({ item }: { item: MenuItem }) {
  const router = useRouter()
  const { text, language } = useLanguage()
  const itemName = language === 'am' && item.nameAm ? item.nameAm : item.nameEn
  const { addItem } = useCart()
  const reducedMotion = useReducedMotion()
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<PriceOption | null>(item.sizes?.[0] ?? null)
  const [selectedAddOns, setSelectedAddOns] = useState<PriceOption[]>([])
  const [note, setNote] = useState('')
  const [addedDrinkId, setAddedDrinkId] = useState<string | null>(null)
  const [unavailableDrinkId, setUnavailableDrinkId] = useState<string | null>(null)
  const drinkFeedbackRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const unavailableDrinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const unitPrice = (selectedSize?.price ?? item.price) + selectedAddOns.reduce((sum, option) => sum + option.price, 0)
  const total = unitPrice * quantity
  const suggestions = item.suggestedDrinkIds?.length
    ? item.suggestedDrinkIds.map((id) => menuItems.find((candidate) => candidate.id === id)).filter((drink): drink is MenuItem => Boolean(drink))
    : popularDrinks
  const drinkPreviewItems = suggestions.length
    ? suggestions
    : menuItems.filter((candidate) => candidate.type === 'drink').slice(0, 3)

  useEffect(() => () => {
    if (drinkFeedbackRef.current) clearTimeout(drinkFeedbackRef.current)
    if (unavailableDrinkTimerRef.current) clearTimeout(unavailableDrinkTimerRef.current)
  }, [])

  function notifyUnavailableDrink(drinkId: string) {
    setUnavailableDrinkId(drinkId)
    if (unavailableDrinkTimerRef.current) clearTimeout(unavailableDrinkTimerRef.current)
    unavailableDrinkTimerRef.current = setTimeout(() => setUnavailableDrinkId(null), 2000)
  }

  function toggleAddOn(option: PriceOption) {
    setSelectedAddOns((current) => current.some((selected) => selected.label === option.label)
      ? current.filter((selected) => selected.label !== option.label)
      : [...current, option])
  }

  function addSuggestedDrink(drink: MenuItem) {
    if (!drink.available) {
      notifyUnavailableDrink(drink.id)
      return
    }
    if (drink.sizes?.length) {
      router.push(`/item/${drink.id}`)
      return
    }
    const price = getDrinkPrice(drink)
    addItem({ id: drink.id, size: null, addOns: [], note: '', quantity: 1, unitPrice: price.price })
    setAddedDrinkId(drink.id)
    if (drinkFeedbackRef.current) clearTimeout(drinkFeedbackRef.current)
    drinkFeedbackRef.current = setTimeout(() => setAddedDrinkId(null), 1100)
  }

  function addCurrentItem(destination: 'menu' | 'order') {
    if (!item.available) return
    addItem({
      id: item.id,
      size: selectedSize?.label ?? null,
      addOns: selectedAddOns.map((option) => option.label),
      note,
      quantity,
      unitPrice,
    })
    if (destination === 'order') router.push('/order')
    else router.push(`/menu/${item.type}`)
  }

  return (
    <main className="item-page">
      <div className="item-page-content">
        <motion.div
          className="item-hero"
          initial={reducedMotion ? false : { opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease }}
        >
          <img src={item.imageUrl} alt={itemName} />
          <Link href={`/menu/${item.type}`} className="item-back-button" aria-label={text('Back to menu')}>
            <ArrowLeft size={20} strokeWidth={2.2} />
          </Link>
        </motion.div>

        <motion.section className="item-intro" initial={reducedMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.42, delay: 0.04, ease }}>
          <h1>{itemName}</h1>
          <p>{item.descriptionEn}</p>
        </motion.section>

        {Boolean(item.ingredients?.length) && (
          <motion.section className="item-option-section" initial={reducedMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08, ease }}>
            <h2>{text('Ingredients')}</h2>
            <div className="ingredient-chips">{item.ingredients?.map((ingredient) => <span key={ingredient}>{ingredient}</span>)}</div>
          </motion.section>
        )}

        {Boolean(item.sizes?.length) && (
          <motion.section className="item-option-section" initial={reducedMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.12, ease }}>
            <h2>{text('Size')}</h2>
            <div className="size-options">
              {item.sizes?.map((option) => (
                <button
                  type="button"
                  key={option.label}
                  className={`size-option${selectedSize?.label === option.label ? ' selected' : ''}`}
                  aria-pressed={selectedSize?.label === option.label}
                  onClick={() => setSelectedSize(option)}
                >
                  <span>{option.label}</span>
                  <strong>{formatPrice(option.price, text('Birr'))}</strong>
                </button>
              ))}
            </div>
          </motion.section>
        )}

        {Boolean(item.addOns?.length) && (
          <motion.section className="item-option-section" initial={reducedMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.16, ease }}>
            <h2>{text('Add-ons')}</h2>
            <div className="addon-list">
              {item.addOns?.map((option) => {
                const checked = selectedAddOns.some((selected) => selected.label === option.label)
                return (
                  <label className="addon-option" key={option.label}>
                    <input type="checkbox" checked={checked} onChange={() => toggleAddOn(option)} />
                    <span>{option.label}</span>
                    <strong>+{formatPrice(option.price, text('Birr'))}</strong>
                  </label>
                )
              })}
            </div>
          </motion.section>
        )}

        <motion.section className="item-option-section item-note-section" initial={reducedMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2, ease }}>
          <label htmlFor="item-note">{text('Note')}</label>
          <textarea id="item-note" value={note} onChange={(event) => setNote(event.target.value)} placeholder={text('Any special requests? (e.g. No onions)')} rows={3} />
        </motion.section>

        {item.type === 'food' && (
          <motion.section className="item-option-section drink-suggestions" initial={reducedMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.24, ease }}>
            <h2>{text('Add a drink')}</h2>
            <div className="suggested-drink-row">
              {suggestions.map((drink) => {
                const price = getDrinkPrice(drink)
                const drinkName = language === 'am' && drink.nameAm ? drink.nameAm : drink.nameEn
                return (
                  <motion.button
                    type="button"
                    className={`suggested-drink-card${drink.available ? '' : ' unavailable'}`}
                    key={drink.id}
                    onClick={() => addSuggestedDrink(drink)}
                    aria-label={`${drink.available ? (addedDrinkId === drink.id ? text('Added to cart') : drink.sizes?.length ? `Choose size for ${drinkName}` : text('Add to cart')) : 'Unavailable'}: ${drinkName}, ${formatPrice(price.price, text('Birr'))}`}
                    whileTap={reducedMotion ? undefined : { scale: 0.97 }}
                  >
                    <span className="suggested-drink-content">
                      <span className="suggested-drink-image-wrap"><img src={drink.imageUrl} alt="" /></span>
                      <span className="suggested-drink-name">{drinkName}</span>
                      <span className="suggested-drink-price-row">
                        <strong>{formatPrice(price.price, text('Birr'))}</strong>
                        <span className="suggested-drink-plus" aria-hidden="true">{addedDrinkId === drink.id ? <Check size={15} /> : <Plus size={15} />}</span>
                      </span>
                    </span>
                    <AnimatePresence>
                      {unavailableDrinkId === drink.id && <motion.span className="unavailable-message drink-unavailable-message" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>{text("This item isn't available for now")}</motion.span>}
                    </AnimatePresence>
                  </motion.button>
                )
              })}
              <MotionLink
                href="/menu/drink"
                className="see-more-drinks"
                whileTap={reducedMotion ? undefined : { scale: 0.97 }}
                initial={false}
                aria-label={text('See more drinks')}
              >
                <span className="see-more-drink-images" aria-hidden="true">
                  {drinkPreviewItems.slice(0, 3).map((drink) => <img key={drink.id} src={drink.imageUrl} alt="" />)}
                </span>
                <span className="see-more-label">{text('See more drinks')}</span>
                <motion.span className="see-more-arrow" aria-hidden="true" whileTap={reducedMotion ? undefined : { x: 4 }} transition={{ type: 'spring', stiffness: 420, damping: 22 }}><ArrowRight size={18} /></motion.span>
              </MotionLink>
            </div>
          </motion.section>
        )}
      </div>

      <footer className="item-action-footer">
        <div className="item-action-inner">
          {!item.available && <p className="unavailable-message item-unavailable-message">{text("This item isn't available for now")}</p>}
          <div className="item-action-topline">
            <div className="quantity-controls">
              <span className="quantity-label">{text('Quantity')}</span>
              <div className="quantity-stepper" aria-label={text('Quantity')}>
                <button type="button" onClick={() => setQuantity((current) => Math.max(0, current - 1))} aria-label={text('Decrease quantity')} disabled={!item.available || quantity <= 0}>
                  <Minus size={16} />
                </button>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span key={quantity} className="quantity-number" initial={reducedMotion ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={reducedMotion ? undefined : { opacity: 0, y: -6 }} transition={{ duration: 0.18, ease }} aria-live="polite">{quantity}</motion.span>
                </AnimatePresence>
                <button type="button" onClick={() => setQuantity((current) => current + 1)} aria-label={text('Increase quantity')} disabled={!item.available}>
                  <Plus size={16} />
                </button>
              </div>
            </div>
            <motion.div className="item-total-block" animate={{ opacity: quantity > 0 ? 1 : 0 }} transition={{ duration: reducedMotion ? 0 : 0.2 }} aria-hidden={quantity === 0}>
              <span>{text('Total')}</span>
              <AnimatePresence mode="wait" initial={false}><motion.strong key={total} initial={reducedMotion ? false : { y: 9, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={reducedMotion ? undefined : { y: -9, opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.25, ease }}>{formatPrice(total, text('Birr'))}</motion.strong></AnimatePresence>
            </motion.div>
          </div>
          <div className="item-action-buttons">
            <button type="button" className="item-add-to-cart" onClick={() => addCurrentItem('menu')} disabled={!item.available || quantity === 0}>{text('Add to cart')}</button>
            <button type="button" className="item-order-now" onClick={() => addCurrentItem('order')} disabled={!item.available || quantity === 0}>{text('Order now')}</button>
          </div>
        </div>
      </footer>
    </main>
  )
}
