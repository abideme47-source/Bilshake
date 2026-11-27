'use client'

import type { MouseEvent, ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCartActions } from '@/lib/cart'

let hasInternalPreviousRoute = false

export function RouteHistoryTracker() {
  const pathname = usePathname()
  const previousPath = useRef<string | null>(null)
  useEffect(() => {
    if (previousPath.current !== null && previousPath.current !== pathname) hasInternalPreviousRoute = true
    previousPath.current = pathname
  }, [pathname])
  return null
}

export function hasPreviousInternalRoute() {
  return hasInternalPreviousRoute
}

export function HistoryBackLink({ href, className, ariaLabel, children }: { href: string; className: string; ariaLabel: string; children: ReactNode }) {
  const router = useRouter()
  const { flushCart } = useCartActions()
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    flushCart()
    if (hasInternalPreviousRoute) router.back()
    else router.push(href)
  }
  return <Link href={href} prefetch onClick={handleClick} className={className} aria-label={ariaLabel}>{children}</Link>
}
