"use client"

import Link from "next/link"
import { useState } from "react"
import { useAdminLocale } from "@/components/admin/admin-locale"
import { authClient } from "@/lib/auth/client"

export default function AdminLoginPage() {
  const { language, setLanguage, t } = useAdminLocale()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<"signin" | "signup">("signin")

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      if (mode === "signup") {
        const allowed = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").toLowerCase().split(",").map(s=>s.trim()).filter(Boolean)
        if (!allowed.includes(email.toLowerCase())) { setError("Not allowed"); setLoading(false); return }
        const res = await authClient.signUp.email({ email, password, name: email })
        if (res.error) { setError(res.error.message || "Sign up failed"); setLoading(false); return }
      } else {
        const res = await authClient.signIn.email({ email, password })
        if (res.error) { setError(res.error.message || "Sign in failed"); setLoading(false); return }
      }
      window.location.href = "/admin"
    } catch (err: any) {
      setError(err?.message || "Error")
    } finally {
      setLoading(false)
    }
  }

  return <main className="login-page" lang={language}><header className="login-top"><Link href="/admin" className="brand"><span className="brand-mark">b</span><span><strong>bilshake</strong><small>{t("admin").toUpperCase()}</small></span></Link><div className="language" role="group" aria-label={t("language")}><button className={language === "en" ? "selected" : ""} onClick={()=>setLanguage("en")}>EN</button><button lang="am" className={language === "am" ? "selected" : ""} onClick={()=>setLanguage("am")}>áŠ áˆ›</button></div></header><section className="login-card"><div className="login-icon"><span className="brand-mark">b</span></div><span className="eyebrow">BILSHAKE · {t("admin").toUpperCase()}</span><h1>{mode === "signin" ? t("signIn") : t("createAccount")}</h1><p>{t("loginTagline")}</p><form onSubmit={submit}><label>{t("email")}<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder={t("emailExample")}/></label><label>{t("password")}<input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"/></label>{error&&<div className="login-notice">{error}</div>}<button type="submit" className="button primary login-submit" disabled={loading}>{loading?"...":(mode==="signin"?t("signIn"):t("createAccount"))}</button></form><div className="login-footer"><span>{t("newToBilshake")}</span></div></section><div className="login-bottom">{t("brandFooter")}</div></main>
}
