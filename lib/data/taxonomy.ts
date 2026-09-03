import type { BookCategory, BookCondition, EducationLevel } from '@/lib/supabase/types'
import type { Dictionary } from '@/lib/i18n/dictionaries/en'

export function categoryLabel(dict: Dictionary, value: BookCategory) {
  return dict.categories[value]
}

export function educationLevelLabel(dict: Dictionary, value: EducationLevel) {
  return dict.educationLevels[value]
}

export function conditionLabel(dict: Dictionary, value: BookCondition) {
  return dict.conditions[value]
}

export function categoryOptions(dict: Dictionary) {
  return (Object.keys(dict.categories) as BookCategory[]).map((value) => ({ value, label: dict.categories[value] }))
}

export function educationLevelOptions(dict: Dictionary) {
  return (Object.keys(dict.educationLevels) as EducationLevel[]).map((value) => ({ value, label: dict.educationLevels[value] }))
}

export function conditionOptions(dict: Dictionary) {
  return (Object.keys(dict.conditions) as BookCondition[]).map((value) => ({ value, label: dict.conditions[value] }))
}

export function languageOptions(dict: Dictionary) {
  return [
    { code: 'fr', label: dict.languages.fr },
    { code: 'en', label: dict.languages.en },
    { code: 'ar', label: dict.languages.ar },
    { code: 'sw', label: dict.languages.sw },
    { code: 'other', label: dict.languages.other },
  ]
}
