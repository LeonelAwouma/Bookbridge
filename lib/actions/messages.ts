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
