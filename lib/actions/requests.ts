'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getServerTranslator } from '@/lib/i18n/server'
import type { ActionResult } from './auth'

export async function createDonationRequestAction(input: {
  bookId: string
  quantityRequested: number
  message: string
}): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: book } = await supabase.from('books').select('status').eq('id', input.bookId).maybeSingle()
  if (!book || !['available', 'requested'].includes(book.status)) {
    const { t } = await getServerTranslator()
    return { error: t('books.alreadyBooked') }
  }

  const { data: existing } = await supabase
    .from('donation_requests')
    .select('id')
    .eq('book_id', input.bookId)
    .eq('requester_id', user.id)
    .eq('status', 'pending')
    .maybeSingle()

  if (existing) {
    const { t } = await getServerTranslator()
    return { error: t('books.alreadyPending') }
  }

  const { error } = await supabase.from('donation_requests').insert({
    book_id: input.bookId,
    requester_id: user.id,
    quantity_requested: input.quantityRequested,
    message: input.message || null,
  })

  if (error) return { error: error.message }
  revalidatePath(`/books/${input.bookId}`)
  revalidatePath('/dashboard')
  return { success: true }
}

export async function acceptDonationRequestAction(requestId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.rpc('accept_donation_request', { p_request_id: requestId })
  if (error) {
    if (error.message.includes('BOOK_ALREADY_BOOKED')) {
      const { t } = await getServerTranslator()
      return { error: t('books.alreadyBooked') }
    }
    return { error: error.message }
  }
  revalidatePath('/dashboard')
  return { success: true }
}

export async function rejectDonationRequestAction(requestId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.rpc('reject_donation_request', { p_request_id: requestId })
  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}

export async function completeDonationRequestAction(requestId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.rpc('complete_donation_request', { p_request_id: requestId })
  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}

export async function cancelDonationRequestAction(requestId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.rpc('cancel_donation_request', { p_request_id: requestId })
  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}

export async function submitReviewAction(input: {
  donationRequestId: string
  revieweeId: string
  rating: number
  comment: string
}): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('reviews').insert({
    donation_request_id: input.donationRequestId,
    reviewer_id: user.id,
    reviewee_id: input.revieweeId,
    rating: input.rating,
    comment: input.comment || null,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { success: true }
}
