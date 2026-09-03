'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
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

export async function cancelBookAction(bookId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('books').update({ status: 'cancelled' }).eq('id', bookId)
  if (error) return { error: error.message }
  revalidatePath('/dashboard')
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
