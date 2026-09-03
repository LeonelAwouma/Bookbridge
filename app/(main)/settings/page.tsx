import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SettingsForm } from '@/components/settings/settings-form'

export const metadata: Metadata = { title: 'Settings — BookBridge' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/settings')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/onboarding')

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <h1 className="font-serif text-3xl">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage your profile and location. Use the language icon in the header to switch EN/FR.</p>
      <div className="mt-6">
        <SettingsForm profile={profile} />
      </div>
    </div>
  )
}
