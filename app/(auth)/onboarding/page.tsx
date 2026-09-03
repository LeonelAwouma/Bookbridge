import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingForm } from '@/components/auth/onboarding-form'

export const metadata: Metadata = {
  title: 'Onboarding — BookBridge',
}

export default async function OnboardingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('user_type, country, city').eq('id', user.id).single()

  if (profile?.country && profile?.city) redirect('/dashboard')

  return <OnboardingForm userType={profile?.user_type ?? 'individual'} />
}
