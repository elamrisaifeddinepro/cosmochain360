'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type Lang = 'fr' | 'en'

const LanguageContext = createContext<{
  lang: Lang
  setLang: (lang: Lang) => void
  t: (fr: string, en: string) => string
}>({
  lang: 'fr',
  setLang: () => {},
  t: (fr) => fr,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('fr')
  const t = (fr: string, en: string) => (lang === 'fr' ? fr : en)
  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
