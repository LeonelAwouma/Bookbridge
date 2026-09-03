import type { UserType } from '@/lib/supabase/types'

export const signupUserTypes: { value: Exclude<UserType, 'admin'>; label: string; hint: string }[] = [
  { value: 'individual', label: 'Individual', hint: 'Former student, parent, teacher, graduate...' },
  { value: 'school', label: 'School', hint: 'Primary or secondary school' },
  { value: 'university', label: 'University', hint: 'Higher education institution' },
  { value: 'library', label: 'Library', hint: 'Community or public library' },
  { value: 'ngo', label: 'NGO', hint: 'Non-governmental organization' },
  { value: 'association', label: 'Association', hint: 'Community association' },
  { value: 'company', label: 'Company', hint: 'Business or CSR program' },
]

export const userTypeLabels: Record<UserType, string> = {
  individual: 'Individual',
  school: 'School',
  university: 'University',
  library: 'Library',
  ngo: 'NGO',
  association: 'Association',
  company: 'Company',
  admin: 'Administrator',
}
