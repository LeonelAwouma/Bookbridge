import type { UserType } from '@/lib/supabase/types'
import type { Dictionary } from '@/lib/i18n/dictionaries/en'

const signupTypeValues: Exclude<UserType, 'admin'>[] = ['individual', 'school', 'university', 'library', 'ngo', 'association', 'company']

export function signupUserTypes(dict: Dictionary) {
  return signupTypeValues.map((value) => ({ value, label: dict.userTypes[value], hint: dict.userTypeHints[value] }))
}

export function userTypeLabel(dict: Dictionary, value: UserType) {
  return dict.userTypes[value]
}
