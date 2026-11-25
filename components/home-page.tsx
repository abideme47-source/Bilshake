'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { banners } from '@/data/banners'
import { settings } from '@/data/settings'
import { BottomDock } from '@/components/menu-page'
import { useLanguage } from '@/lib/language'

const ease = [0.22, 1, 0.36, 1] as const
const activeBanners = banners.filter((banner) => banner.active)

function LanguageSwitch() {
  const { language, toggle, text } = useLanguage()
  return (
    <button
      type="button"
      aria-label={text('Choose language')}
      aria-pressed={language === 'am'}
      onClick={toggle}
      className="language-switch"
    >
      <motion.span className="language-highlight" initial={{ x: 0 }} animate={{ x: language === 'en' ? 0 : 42 }} transition={{ duration: 0.42, ease }} />
      <span className={language === 'en' ? 'language-option active' : 'language-option'}>EN</span>
      <span className="language-divider">|</span>
      <span className={language === 'am' ? 'language-option active' : 'language-option'}>አማ</span>
    </button>
  )
}

function BannerSlider() {
  const { language, text } = useLanguage()
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pauseRef = useRef(false)
  const reducedMotion = useReducedMotion()

  const goTo = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
    const track = trackRef.current
    if (!track) return
    const next = (index + activeBanners.length) % activeBanners.length
    const card = track.children.item(next) as HTMLElement | null
    if (card) track.scrollTo({ left: card.offsetLeft - track.offsetLeft - 20, behavior })
    setActiveIndex(next)
  }, [])

  useEffect(() => {
    if (activeBanners.length < 2) return
    timerRef.current = setInterval(() => {
      if (!pauseRef.current) goTo(activeIndex + 1)
    }, 9000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [activeIndex, goTo])

  const handleScroll = () => {
    const track = trackRef.current
    if (!track) return
    const cards = Array.from(track.children) as HTMLElement[]
    const nearest = cards.reduce((best, card, index) => {
      const distance = Math.abs(card.offsetLeft - track.offsetLeft - track.scrollLeft)
      return distance < best.distance ? { index, distance } : best
    }, { index: 0, distance: Number.POSITIVE_INFINITY })
    setActiveIndex(nearest.index)
  }

  return (
    <section className="banner-section" aria-label="Special offers">
      <div
        className="banner-track"
        ref={trackRef}
        onScroll={handleScroll}
        onTouchStart={() => { pauseRef.current = true }}
        onTouchEnd={() => { pauseRef.current = false }}
        onPointerDown={() => { pauseRef.current = true }}
        onPointerUp={() => { pauseRef.current = false }}
      >
        {activeBanners.map((banner, index) => (
          <motion.article
            key={banner.id}
            className="banner-card"
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.62, delay: 0.16 + index * 0.08, ease }}
            style={{ backgroundImage: `linear-gradient(0deg, rgba(13, 24, 34, .73) 0%, rgba(13, 24, 34, .06) 57%, transparent 100%), url("${banner.imageUrl}")` }}
          >
            <div className="banner-copy">
              <h2>{language === 'am' && banner.titleAm ? banner.titleAm : banner.title}</h2>
              <p>{banner.tillDate.replace(/^Till/, text('Till'))}</p>
            </div>
          </motion.article>
        ))}
      </div>
      {activeBanners.length > 1 && <div className="banner-dots" aria-label={`Slide ${activeIndex + 1} of ${activeBanners.length}`}>
        {activeBanners.map((banner, index) => <button key={banner.id} type="button" aria-label={`Show banner ${index + 1}`} aria-current={index === activeIndex} onClick={() => goTo(index)} className={`banner-dot${index === activeIndex ? ' selected' : ''}`} />)}
      </div>}
    </section>
  )
}

function CategoryCard({ title, href, tone, delay }: { title: string; href: string; tone: 'food' | 'drink'; delay: number }) {
  const reducedMotion = useReducedMotion()
  return (
    <motion.div initial={reducedMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.62, delay, ease }} whileTap={{ scale: 0.97 }}>
      <Link href={href} className={`category-card ${tone}`}>
        <span className="category-label">{title}</span>
        <span className="category-arrow" aria-hidden="true"><ArrowUpRight size={19} strokeWidth={2.2} /></span>
      </Link>
    </motion.div>
  )
}

export function HomePage() {
  const reducedMotion = useReducedMotion()
  const { text } = useLanguage()
  return (
    <main className="home-shell">
      <div className={`ambient-grid${reducedMotion ? ' still' : ''}`} aria-hidden="true" />
      <header className="topbar">
        <Link className="orders-pill" href="/orders">{text('My orders')}</Link>
        <LanguageSwitch />
      </header>
      <motion.section className="welcome" initial={reducedMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.62, ease }}>
        <p>{text('Welcome to')}</p>
        <h1>{text('Bilshake')}</h1>
      </motion.section>
      {activeBanners.length > 0 && <BannerSlider />}
      <section className="category-grid" aria-label="Browse menu">
        <CategoryCard title={text('Food')} href="/menu/food" tone="food" delay={0.28} />
        <CategoryCard title={text('Drink')} href="/menu/drink" tone="drink" delay={0.36} />
      </section>
      <BottomDock home />
    </main>
  )
}
