'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { translateFor } from '@/lib/i18n/server'
import type { ActionResult } from './auth'
import type { ReportStatus, VerificationStatus } from '@/lib/supabase/types'

export async function setOrganizationVerificationAction(organizationId: string, status: VerificationStatus): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('organizations').update({ verification_status: status }).eq('id', organizationId)
  if (error) return { error: error.message }

  if (status === 'verified') {
    const { data: org } = await supabase.from('organizations').select('owner_id, name').eq('id', organizationId).single()
    if (org) {
      const { data: owner } = await supabase.from('profiles').select('locale').eq('id', org.owner_id).single()
      await supabase.from('notifications').insert({
        profile_id: org.owner_id,
        type: 'org_verified',
        title: translateFor(owner?.locale, 'notify.orgVerifiedTitle', { name: org.name }),
        link: `/organizations/${organizationId}`,
      })
    }
  }

  revalidatePath('/admin/organizations')
  return { success: true }
}

export async function resolveReportAction(reportId: string, status: ReportStatus): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('reports')
    .update({ status, resolved_by: user.id, resolved_at: new Date().toISOString() })
    .eq('id', reportId)

  if (error) return { error: error.message }
  revalidatePath('/admin/reports')
  return { success: true }
}

export async function setUserBlockedAction(profileId: string, blocked: boolean): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('profiles').update({ is_blocked: blocked }).eq('id', profileId)
  if (error) return { error: error.message }
  revalidatePath('/admin/users')
  return { success: true }
}
