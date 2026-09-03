import type { Dictionary } from './dictionaries/en'

type Path<T, Prefix extends string = ''> = T extends object
  ? { [K in keyof T & string]: Path<T[K], `${Prefix}${K}.`> }[keyof T & string]
  : Prefix extends `${infer P}.` ? P : never

export type TranslationKey = Path<Dictionary>

function resolve(dictionary: Dictionary, key: string): string {
  const value = key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in acc) return (acc as Record<string, unknown>)[part]
    return undefined
  }, dictionary)
  return typeof value === 'string' ? value : key
}

export function translate(dictionary: Dictionary, key: TranslationKey, vars?: Record<string, string | number>) {
  let text = resolve(dictionary, key)
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replace(new RegExp(`\\{${name}\\}`, 'g'), String(value))
    }
  }
  return text
}
