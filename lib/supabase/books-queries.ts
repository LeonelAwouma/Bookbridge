import { createClient } from './server'
import type { Book, BookCategory, BookCondition, EducationLevel } from './types'

export interface BookWithExtras extends Book {
  images: string[]
  donorName: string | null
  donorRating: number | null
  organizationName: string | null
  organizationVerified: boolean
}

export interface BookFilters {
  country?: string
  city?: string
  category?: BookCategory
  educationLevel?: EducationLevel
  language?: string
  condition?: BookCondition
  search?: string
  source?: 'individual' | 'organization'
  status?: Book['status'][]
  limit?: number
  donorId?: string
  organizationId?: string
  ids?: string[]
}

export async function getBooks(filters: BookFilters = {}): Promise<BookWithExtras[]> {
  const supabase = await createClient()

  let query = supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(filters.limit ?? 40)

  query = query.in('status', filters.status ?? ['available'])
  if (filters.ids) query = query.in('id', filters.ids)
  if (filters.country) query = query.eq('country', filters.country)
  if (filters.city) query = query.ilike('city', filters.city.trim())
  if (filters.category) query = query.eq('category', filters.category)
  if (filters.educationLevel) query = query.eq('education_level', filters.educationLevel)
  if (filters.language) query = query.eq('language', filters.language)
  if (filters.condition) query = query.eq('condition', filters.condition)
  if (filters.donorId) query = query.eq('donor_id', filters.donorId)
  if (filters.organizationId) query = query.eq('organization_id', filters.organizationId)
  if (filters.source === 'individual') query = query.not('donor_id', 'is', null)
  if (filters.source === 'organization') query = query.not('organization_id', 'is', null)
  if (filters.search) {
    const term = filters.search.replace(/[%_]/g, '')
    query = query.or(`title.ilike.%${term}%,author.ilike.%${term}%,subject.ilike.%${term}%`)
  }

  const { data: books, error } = await query
  if (error || !books) return []

  return enrichBooks(books)
}

export async function getBookById(id: string): Promise<BookWithExtras | null> {
  const supabase = await createClient()
  const { data: book, error } = await supabase.from('books').select('*').eq('id', id).single()
  if (error || !book) return null
  const [enriched] = await enrichBooks([book])
  return enriched ?? null
}

async function enrichBooks(books: Book[]): Promise<BookWithExtras[]> {
  const supabase = await createClient()
  const bookIds = books.map((b) => b.id)
  const donorIds = [...new Set(books.map((b) => b.donor_id).filter((v): v is string => !!v))]
  const orgIds = [...new Set(books.map((b) => b.organization_id).filter((v): v is string => !!v))]

  const [{ data: images }, { data: donors }, { data: orgs }] = await Promise.all([
    bookIds.length ? supabase.from('book_images').select('book_id, url, position').in('book_id', bookIds).order('position') : Promise.resolve({ data: [] }),
    donorIds.length ? supabase.from('profiles').select('id, full_name, rating_avg').in('id', donorIds) : Promise.resolve({ data: [] }),
    orgIds.length ? supabase.from('organizations').select('id, name, verification_status').in('id', orgIds) : Promise.resolve({ data: [] }),
  ])

  const imagesByBook = new Map<string, string[]>()
  for (const img of images ?? []) {
    const list = imagesByBook.get(img.book_id) ?? []
    list.push(img.url)
    imagesByBook.set(img.book_id, list)
  }
  const donorById = new Map((donors ?? []).map((d) => [d.id, d]))
  const orgById = new Map((orgs ?? []).map((o) => [o.id, o]))

  return books.map((book) => {
    const donor = book.donor_id ? donorById.get(book.donor_id) : undefined
    const org = book.organization_id ? orgById.get(book.organization_id) : undefined
    return {
      ...book,
      images: imagesByBook.get(book.id) ?? [],
      donorName: donor?.full_name ?? null,
      donorRating: donor?.rating_avg ?? null,
      organizationName: org?.name ?? null,
      organizationVerified: org?.verification_status === 'verified',
    }
  })
}
