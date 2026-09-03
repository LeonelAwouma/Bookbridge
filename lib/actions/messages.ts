'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { translateFor } from '@/lib/i18n/server'
import type { ActionResult } from './auth'

export async function sendMessageAction(input: { conversationId: string; body: string }): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  if (!input.body.trim()) return { error: 'Message cannot be empty' }

  const { error } = await supabase.from('messages').insert({
    conversation_id: input.conversationId,
    sender_id: user.id,
    body: input.body.trim(),
  })

  if (error) return { error: error.message }

  const { data: participants } = await supabase
    .from('conversation_participants')
    .select('profile_id')
    .eq('conversation_id', input.conversationId)
    .neq('profile_id', user.id)

  if (participants) {
    const { data: recipients } = await supabase
      .from('profiles')
      .select('id, locale')
      .in(
        'id',
        participants.map((p) => p.profile_id),
      )
    const localeById = new Map((recipients ?? []).map((r) => [r.id, r.locale]))

    for (const p of participants) {
      await supabase.from('notifications').insert({
        profile_id: p.profile_id,
        type: 'new_message',
        title: translateFor(localeById.get(p.profile_id), 'notify.newMessageTitle'),
        body: input.body.trim().slice(0, 140),
        link: `/messages/${input.conversationId}`,
      })
    }
  }

  revalidatePath(`/messages/${input.conversationId}`)
  return { success: true }
}

export async function startBookConversationAction(bookId: string): Promise<ActionResult & { conversationId?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: book } = await supabase.from('books').select('donor_id, organization_id').eq('id', bookId).maybeSingle()
  if (!book) return { error: 'Book not found' }

  let ownerId = book.donor_id
  if (!ownerId && book.organization_id) {
    const { data: org } = await supabase.from('organizations').select('owner_id').eq('id', book.organization_id).maybeSingle()
    ownerId = org?.owner_id ?? null
  }
  if (!ownerId) return { error: 'This book has no owner to contact.' }
  if (ownerId === user.id) return { error: 'You cannot message yourself.' }

  const { data: existingConvs } = await supabase.from('conversations').select('id').eq('book_id', bookId)
  if (existingConvs && existingConvs.length > 0) {
    const convIds = existingConvs.map((c) => c.id)
    const { data: participantRows } = await supabase
      .from('conversation_participants')
      .select('conversation_id, profile_id')
      .in('conversation_id', convIds)
    for (const convId of convIds) {
      const members = new Set((participantRows ?? []).filter((p) => p.conversation_id === convId).map((p) => p.profile_id))
      if (members.has(user.id) && members.has(ownerId)) {
        return { success: true, conversationId: convId }
      }
    }
  }

  // Generate the id up front: RLS only makes a conversation SELECT-visible once
  // the current user is a participant, so `.insert().select()` would come back
  // empty at this point (RETURNING is filtered by the SELECT policy too).
  const conversationId = crypto.randomUUID()
  const { error } = await supabase.from('conversations').insert({ id: conversationId, book_id: bookId })
  if (error) return { error: error.message }

  const { error: participantsError } = await supabase.from('conversation_participants').insert([
    { conversation_id: conversationId, profile_id: user.id },
    { conversation_id: conversationId, profile_id: ownerId },
  ])
  if (participantsError) return { error: participantsError.message }

  revalidatePath('/messages')
  return { success: true, conversationId }
}
