'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getServerTranslator, translateFor } from '@/lib/i18n/server'
import { notifyByEmail } from '@/lib/notify-email'
import type { ActionResult } from './auth'
import type { BookCategory, BookCondition, EducationLevel } from '@/lib/supabase/types'

export interface CreateBookInput {
  donorProfileId: string | null
  organizationId: string | null
  title: string
  author: string
  isbn: string
  category: BookCategory
  subject: string
  educationLevel: EducationLevel
  language: string
  condition: BookCondition
  quantity: number
  description: string
  country: string
  region: string
  city: string
  neighborhood: string
  latitude: number | null
  longitude: number | null
  pickupAvailable: boolean
  dropoffAvailable: boolean
}

export async function createBookAction(input: CreateBookInput): Promise<ActionResult & { bookId?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('books')
    .insert({
      donor_id: input.organizationId ? null : user.id,
      organization_id: input.organizationId,
      title: input.title,
      author: input.author || null,
      isbn: input.isbn || null,
      category: input.category,
      subject: input.subject || null,
      education_level: input.educationLevel,
      language: input.language,
      condition: input.condition,
      quantity: input.quantity,
      quantity_available: input.quantity,
      description: input.description || null,
      country: input.country,
      region: input.region || null,
      city: input.city,
      neighborhood: input.neighborhood || null,
      latitude: input.latitude,
      longitude: input.longitude,
      pickup_available: input.pickupAvailable,
      dropoff_available: input.dropoffAvailable,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  revalidatePath('/books')
  revalidatePath('/')
  return { success: true, bookId: data.id }
}

export async function attachBookImagesAction(bookId: string, urls: string[]): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('book_images').insert(urls.map((url, position) => ({ book_id: bookId, url, position })))
  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteBookImageAction(bookId: string, imageId: string, url: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('book_images').delete().eq('id', imageId)
  if (error) return { error: error.message }

  const marker = '/book-images/'
  const markerIndex = url.indexOf(marker)
  if (markerIndex !== -1) {
    const path = url.slice(markerIndex + marker.length)
    await supabase.storage.from('book-images').remove([path])
  }

  revalidatePath(`/books/${bookId}`)
  return { success: true }
}

export interface UpdateBookInput {
  title: string
  author: string
  isbn: string
  category: BookCategory
  subject: string
  educationLevel: EducationLevel
  language: string
  condition: BookCondition
  quantity: number
  description: string
  country: string
  region: string
  city: string
  neighborhood: string
  latitude: number | null
  longitude: number | null
  pickupAvailable: boolean
  dropoffAvailable: boolean
}

export async function updateBookAction(bookId: string, input: UpdateBookInput): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: book } = await supabase.from('books').select('quantity, quantity_available, status').eq('id', bookId).maybeSingle()
  if (!book) return { error: 'Book not found' }
  const { t } = await getServerTranslator()
  if (book.status === 'completed' || book.status === 'cancelled') {
    return { error: t('donate.editNotAllowedError') }
  }

  const alreadyGiven = book.quantity - book.quantity_available
  if (input.quantity < alreadyGiven) {
    return { error: t('donate.quantityBelowGivenError', { count: alreadyGiven }) }
  }

  const { error } = await supabase
    .from('books')
    .update({
      title: input.title,
      author: input.author || null,
      isbn: input.isbn || null,
      category: input.category,
      subject: input.subject || null,
      education_level: input.educationLevel,
      language: input.language,
      condition: input.condition,
      quantity: input.quantity,
      quantity_available: input.quantity - alreadyGiven,
      description: input.description || null,
      country: input.country,
      region: input.region || null,
      city: input.city,
      neighborhood: input.neighborhood || null,
      latitude: input.latitude,
      longitude: input.longitude,
      pickup_available: input.pickupAvailable,
      dropoff_available: input.dropoffAvailable,
    })
    .eq('id', bookId)

  if (error) return { error: error.message }

  revalidatePath(`/books/${bookId}`)
  revalidatePath('/dashboard/donations')
  revalidatePath('/books')
  return { success: true }
}

export async function withdrawBookAction(bookId: string): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: pendingRequests } = await supabase
    .from('donation_requests')
    .select('requester_id')
    .eq('book_id', bookId)
    .eq('status', 'pending')

  const { error } = await supabase.rpc('withdraw_book_listing', { p_book_id: bookId })
  if (error) {
    if (error.message.includes('BOOK_NOT_EDITABLE')) {
      const { t } = await getServerTranslator()
      return { error: t('donate.editNotAllowedError') }
    }
    return { error: error.message }
  }

  if (pendingRequests && pendingRequests.length > 0) {
    const { data: requesters } = await supabase
      .from('profiles')
      .select('id, locale')
      .in('id', pendingRequests.map((r) => r.requester_id))
    for (const requester of requesters ?? []) {
      await notifyByEmail(
        requester.id,
        translateFor(requester.locale, 'notify.listingWithdrawnTitle'),
        translateFor(requester.locale, 'notify.listingWithdrawnBody'),
        '/books',
      )
    }
  }

  revalidatePath('/dashboard/donations')
  revalidatePath(`/books/${bookId}`)
  revalidatePath('/books')
  return { success: true }
}

export async function toggleSavedBookAction(bookId: string, save: boolean): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  if (save) {
    const { error } = await supabase.from('saved_books').insert({ profile_id: user.id, book_id: bookId })
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase.from('saved_books').delete().eq('profile_id', user.id).eq('book_id', bookId)
    if (error) return { error: error.message }
  }
  revalidatePath('/saved')
  return { success: true }
}
