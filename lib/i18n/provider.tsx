'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { defaultLocale, getDictionary, LOCALE_COOKIE, type Locale } from './config'
import { translate, type TranslationKey } from './translate'
import { updateProfileLocaleAction } from '@/lib/actions/profile'
import type { Dictionary } from './dictionaries/en'

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string
  dict: Dictionary
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ locale: initialLocale, children }: { locale: Locale; children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale ?? defaultLocale)
  const dictionary = useMemo(() => getDictionary(locale), [locale])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000`
    updateProfileLocaleAction(next).finally(() => window.location.reload())
  }, [])

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => translate(dictionary, key, vars),
    [dictionary],
  )

  const value = useMemo(() => ({ locale, setLocale, t, dict: dictionary }), [locale, setLocale, t, dictionary])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
