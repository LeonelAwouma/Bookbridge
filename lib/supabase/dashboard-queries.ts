import { createClient } from './server'
import type { Book, DonationRequest } from './types'

export interface RequestWithContext extends DonationRequest {
  bookTitle: string
  requesterName: string
}

export async function getMyBooksWithRequests(userId: string): Promise<{ book: Book; requests: RequestWithContext[] }[]> {
  const supabase = await createClient()
  const { data: orgs } = await supabase.from('organizations').select('id').eq('owner_id', userId)
  const orgIds = (orgs ?? []).map((o) => o.id)

  let query = supabase.from('books').select('*').order('created_at', { ascending: false })
  query = orgIds.length ? query.or(`donor_id.eq.${userId},organization_id.in.(${orgIds.join(',')})`) : query.eq('donor_id', userId)
  const { data: books } = await query
  if (!books || books.length === 0) return []

  const bookIds = books.map((b) => b.id)
  const { data: requests } = await supabase
    .from('donation_requests')
    .select('*')
    .in('book_id', bookIds)
    .order('created_at', { ascending: false })

  const requesterIds = [...new Set((requests ?? []).map((r) => r.requester_id))]
  const { data: requesters } = requesterIds.length
    ? await supabase.from('profiles').select('id, full_name').in('id', requesterIds)
    : { data: [] }
  const requesterById = new Map((requesters ?? []).map((r) => [r.id, r.full_name]))
  const bookById = new Map(books.map((b) => [b.id, b]))

  const requestsByBook = new Map<string, RequestWithContext[]>()
  for (const r of requests ?? []) {
    const list = requestsByBook.get(r.book_id) ?? []
    list.push({ ...r, bookTitle: bookById.get(r.book_id)?.title ?? '', requesterName: requesterById.get(r.requester_id) ?? 'BookBridge user' })
    requestsByBook.set(r.book_id, list)
  }

  return books.map((book) => ({ book, requests: requestsByBook.get(book.id) ?? [] }))
}

export async function getMyRequests(userId: string) {
  const supabase = await createClient()
  const { data: requests } = await supabase
    .from('donation_requests')
    .select('*')
    .eq('requester_id', userId)
    .order('created_at', { ascending: false })

  if (!requests || requests.length === 0) return []

  const bookIds = [...new Set(requests.map((r) => r.book_id))]
  const { data: books } = await supabase.from('books').select('id, title, city, status').in('id', bookIds)
  const bookById = new Map((books ?? []).map((b) => [b.id, b]))

  return requests.map((r) => ({ ...r, book: bookById.get(r.book_id) }))
}

export async function getMyNeeds(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('book_needs').select('*').eq('requester_id', userId).order('created_at', { ascending: false })
  return data ?? []
}
