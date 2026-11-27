"use client"

import { createContext, useContext, useMemo, useState } from "react"
import { translations, type Language, type TranslationKey } from "@/data/admin-translations"

export type AdminCategory = { name: string; am?: string }
type AdminLocaleValue = { language: Language; setLanguage: (language: Language) => void; t: (key: TranslationKey) => string; categories: AdminCategory[]; setCategories: React.Dispatch<React.SetStateAction<AdminCategory[]>> }
const AdminLocaleContext = createContext<AdminLocaleValue | null>(null)

export function AdminLocaleProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")
  const [categories, setCategories] = useState<AdminCategory[]>([{ name: "Burgers" }, { name: "Pizza" }, { name: "Juices" }, { name: "Shawarma" }, { name: "Fasting" }])
  const value = useMemo(() => ({ language, setLanguage, t: (key: TranslationKey) => translations[language][key], categories, setCategories }), [language, categories])
  return <AdminLocaleContext.Provider value={value}>{children}</AdminLocaleContext.Provider>
}

export function useAdminLocale() {
  const value = useContext(AdminLocaleContext)
  if (!value) throw new Error("useAdminLocale must be used inside AdminLocaleProvider")
  return value
}
