'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from './auth'

export async function completeOnboardingAction(input: {
  country: string
  region: string
  city: string
  neighborhood: string
  latitude: number | null
  longitude: number | null
  bio: string
}): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update({
      country: input.country,
      region: input.region || null,
      city: input.city,
      neighborhood: input.neighborhood || null,
      latitude: input.latitude,
      longitude: input.longitude,
      bio: input.bio || null,
    })
    .eq('id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function updateProfileAction(input: {
  fullName: string
  bio: string
  phone: string
  country: string
  region: string
  city: string
  neighborhood: string
  locale: string
}): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: input.fullName,
      bio: input.bio || null,
      phone: input.phone || null,
      country: input.country,
      region: input.region || null,
      city: input.city,
      neighborhood: input.neighborhood || null,
      locale: input.locale,
    })
    .eq('id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}
