'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { Lang, translations } from './i18n'

interface LangCtx { lang: Lang; setLang: (l: Lang) => void }
const Ctx = createContext<LangCtx>({ lang: 'en', setLang: () => {} })

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ls_lang') as Lang | null
      if (saved === 'de' || saved === 'en') setLangState(saved)
    } catch { /* */ }
  }, [])

  function setLang(l: Lang) {
    setLangState(l)
    try { localStorage.setItem('ls_lang', l) } catch { /* */ }
  }

  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>
}

export function useLang() { return useContext(Ctx) }

export function useT() {
  const { lang } = useContext(Ctx)
  return translations[lang]
}
