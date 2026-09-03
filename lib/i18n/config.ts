import en from './dictionaries/en'
import fr from './dictionaries/fr'

export const locales = ['en', 'fr'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'fr'
export const LOCALE_COOKIE = 'locale'

export const dictionaries = { en, fr }

export function getDictionary(locale: Locale) {
  return dictionaries[locale] ?? dictionaries[defaultLocale]
}

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value)
}
