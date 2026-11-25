'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { translations } from '@/data/translations'

type Language = 'en' | 'am'
const LanguageContext = createContext<{ language: Language; toggle: () => void; text: (english: string) => string } | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    const stored = window.localStorage.getItem('bilshake-language')
    if (stored === 'am' || stored === 'en') setLanguage(stored)
    setHydrated(true)
  }, [])
  useEffect(() => {
    if (!hydrated) return
    document.documentElement.lang = language
    document.documentElement.classList.toggle('amharic', language === 'am')
    window.localStorage.setItem('bilshake-language', language)
  }, [hydrated, language])
  const text = (english: string) => language === 'am' ? (translations.am as Record<string, string>)[english] || english : english
  return <LanguageContext.Provider value={{ language, toggle: () => setLanguage((value) => value === 'en' ? 'am' : 'en'), text }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const value = useContext(LanguageContext)
  if (!value) throw new Error('useLanguage must be used within LanguageProvider')
  return value
}
