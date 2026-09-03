'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from './auth'
import type { OrganizationType } from '@/lib/supabase/types'

export interface CreateOrganizationInput {
  name: string
  organizationType: OrganizationType
  description: string
  logoUrl: string | null
  country: string
  region: string
  city: string
  neighborhood: string
  latitude: number | null
  longitude: number | null
  contactPerson: string
  contactEmail: string
  contactPhone: string
}

export async function createOrganizationAction(input: CreateOrganizationInput): Promise<ActionResult & { organizationId?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('organizations')
    .insert({
      owner_id: user.id,
      name: input.name,
      organization_type: input.organizationType,
      description: input.description || null,
      logo_url: input.logoUrl,
      country: input.country,
      region: input.region || null,
      city: input.city,
      neighborhood: input.neighborhood || null,
      latitude: input.latitude,
      longitude: input.longitude,
      contact_person: input.contactPerson || null,
      contact_email: input.contactEmail || null,
      contact_phone: input.contactPhone || null,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }
  revalidatePath('/organizations')
  return { success: true, organizationId: data.id }
}

export async function requestOrganizationVerificationAction(organizationId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('organizations').update({ verification_status: 'pending' }).eq('id', organizationId)
  if (error) return { error: error.message }
  revalidatePath(`/organizations/${organizationId}`)
  return { success: true }
}
