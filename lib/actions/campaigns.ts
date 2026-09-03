'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from './auth'
import type { BookCategory, EducationLevel } from '@/lib/supabase/types'

export interface CreateCampaignInput {
  organizationId: string
  title: string
  description: string
  goalQuantity: number
  country: string
  region: string
  city: string
  category: BookCategory | null
  educationLevel: EducationLevel | null
  deadline: string
}

export async function createCampaignAction(input: CreateCampaignInput): Promise<ActionResult & { campaignId?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      organization_id: input.organizationId,
      title: input.title,
      description: input.description || null,
      goal_quantity: input.goalQuantity,
      country: input.country,
      region: input.region || null,
      city: input.city,
      category: input.category,
      education_level: input.educationLevel,
      deadline: input.deadline || null,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }
  revalidatePath('/campaigns')
  return { success: true, campaignId: data.id }
}

export async function donateToCampaignAction(input: { campaignId: string; quantity: number }): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('campaign_donations').insert({
    campaign_id: input.campaignId,
    donor_id: user.id,
    quantity: input.quantity,
  })

  if (error) return { error: error.message }
  revalidatePath(`/campaigns/${input.campaignId}`)
  return { success: true }
}
