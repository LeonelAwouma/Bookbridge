import { cookies } from 'next/headers'
import { defaultLocale, getDictionary, isLocale, LOCALE_COOKIE, type Locale } from './config'
import { translate, type TranslationKey } from './translate'

export function translateFor(locale: string | null | undefined, key: TranslationKey, vars?: Record<string, string | number>) {
  const resolved: Locale = isLocale(locale) ? locale : defaultLocale
  return translate(getDictionary(resolved), key, vars)
}

export async function getServerLocale() {
  const cookieStore = await cookies()
  const value = cookieStore.get(LOCALE_COOKIE)?.value
  return isLocale(value) ? value : defaultLocale
}

export async function getServerDictionary() {
  return getDictionary(await getServerLocale())
}

export async function getServerTranslator() {
  const dict = await getServerDictionary()
  const t = (key: TranslationKey, vars?: Record<string, string | number>) => translate(dict, key, vars)
  return { dict, t }
}
