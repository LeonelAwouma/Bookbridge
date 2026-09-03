import type { BookCategory, BookCondition, EducationLevel } from '@/lib/supabase/types'

export const categoryLabels: Record<BookCategory, string> = {
  primary_school: 'Primary school',
  secondary_school: 'Secondary school',
  university: 'University',
  mathematics: 'Mathematics',
  science: 'Science',
  physics: 'Physics',
  chemistry: 'Chemistry',
  biology: 'Biology',
  literature: 'Literature',
  languages: 'Languages',
  history: 'History',
  geography: 'Geography',
  computer_science: 'Computer Science',
  engineering: 'Engineering',
  medicine: 'Medicine',
  business: 'Business',
  economics: 'Economics',
  law: 'Law',
  childrens_books: "Children's books",
  dictionaries: 'Dictionaries',
  encyclopedias: 'Encyclopedias',
  exam_preparation: 'Exam preparation',
  professional_books: 'Professional books',
  fiction: 'Fiction',
  other: 'Other',
}

export const educationLevelLabels: Record<EducationLevel, string> = {
  preschool: 'Preschool',
  primary: 'Primary',
  secondary: 'Secondary',
  university: 'University',
  professional: 'Professional',
  adult: 'Adult',
  all_levels: 'All levels',
}

export const conditionLabels: Record<BookCondition, string> = {
  like_new: 'Like new',
  good: 'Good',
  used: 'Used',
  heavily_used: 'Heavily used but readable',
}

export const languageOptions = [
  { code: 'fr', label: 'French' },
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'Arabic' },
  { code: 'sw', label: 'Swahili' },
  { code: 'other', label: 'Other' },
]

export const categoryOptions = Object.entries(categoryLabels).map(([value, label]) => ({ value: value as BookCategory, label }))
export const educationLevelOptions = Object.entries(educationLevelLabels).map(([value, label]) => ({ value: value as EducationLevel, label }))
export const conditionOptions = Object.entries(conditionLabels).map(([value, label]) => ({ value: value as BookCondition, label }))
