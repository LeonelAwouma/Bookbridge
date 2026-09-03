'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from './auth'

export async function markNotificationReadAction(notificationId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId)
  if (error) return { error: error.message }
  revalidatePath('/notifications')
  return { success: true }
}

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('profile_id', user.id).eq('is_read', false)
  if (error) return { error: error.message }
  revalidatePath('/notifications')
  return { success: true }
}
