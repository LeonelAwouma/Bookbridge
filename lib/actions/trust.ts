'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from './auth'
import type { ReportTargetType } from '@/lib/supabase/types'

export async function createReportAction(input: {
  targetType: ReportTargetType
  targetId: string
  reason: string
  description: string
}): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('reports').insert({
    reporter_id: user.id,
    target_type: input.targetType,
    target_id: input.targetId,
    reason: input.reason,
    description: input.description || null,
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function blockUserAction(blockedId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('blocked_users').insert({ blocker_id: user.id, blocked_id: blockedId })
  if (error) return { error: error.message }
  return { success: true }
}

export async function unblockUserAction(blockedId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('blocked_users').delete().eq('blocker_id', user.id).eq('blocked_id', blockedId)
  if (error) return { error: error.message }
  return { success: true }
}
