'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from './auth'
import type { BookCategory, EducationLevel, NeedPriority } from '@/lib/supabase/types'

export interface CreateNeedInput {
  organizationId: string | null
  title: string
  category: BookCategory
  subject: string
  educationLevel: EducationLevel
  language: string
  quantityNeeded: number
  description: string
  priority: NeedPriority
  deadline: string
  country: string
  region: string
  city: string
  neighborhood: string
  latitude: number | null
  longitude: number | null
}

export async function createNeedAction(input: CreateNeedInput): Promise<ActionResult & { needId?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('book_needs')
    .insert({
      requester_id: input.organizationId ? null : user.id,
      organization_id: input.organizationId,
      title: input.title,
      category: input.category,
      subject: input.subject || null,
      education_level: input.educationLevel,
      language: input.language,
      quantity_needed: input.quantityNeeded,
      description: input.description || null,
      priority: input.priority,
      deadline: input.deadline || null,
      country: input.country,
      region: input.region || null,
      city: input.city,
      neighborhood: input.neighborhood || null,
      latitude: input.latitude,
      longitude: input.longitude,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }
  revalidatePath('/requests')
  return { success: true, needId: data.id }
}

export async function closeNeedAction(needId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('book_needs').update({ status: 'closed' }).eq('id', needId)
  if (error) return { error: error.message }
  revalidatePath('/requests')
  redirect('/dashboard/requests')
}
