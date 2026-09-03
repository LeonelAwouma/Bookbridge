import { cookies } from 'next/headers'
import { defaultLocale, getDictionary, isLocale, LOCALE_COOKIE } from './config'

export async function getServerLocale() {
  const cookieStore = await cookies()
  const value = cookieStore.get(LOCALE_COOKIE)?.value
  return isLocale(value) ? value : defaultLocale
}

export async function getServerDictionary() {
  return getDictionary(await getServerLocale())
}
