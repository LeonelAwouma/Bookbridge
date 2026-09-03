import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DonateForm } from '@/components/donate/donate-form'
import { emptyLocation } from '@/components/location/location-picker'

export const metadata: Metadata = {
  title: 'Donate Books — BookBridge',
}

export default async function DonatePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/donate')

  const [{ data: profile }, { data: organizations }] = await Promise.all([
    supabase.from('profiles').select('country, region, city, neighborhood, latitude, longitude').eq('id', user.id).single(),
    supabase.from('organizations').select('id, name').eq('owner_id', user.id),
  ])

  const initialLocation = {
    country: profile?.country ?? emptyLocation.country,
    region: profile?.region ?? emptyLocation.region,
    city: profile?.city ?? emptyLocation.city,
    neighborhood: profile?.neighborhood ?? emptyLocation.neighborhood,
    latitude: profile?.latitude ?? null,
    longitude: profile?.longitude ?? null,
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <div className="mb-8">
        <p className="eyebrow">BookBridge</p>
        <h1 className="mt-2 font-serif text-3xl sm:text-4xl">Donate books</h1>
        <p className="mt-2 text-sm text-muted-foreground">Takes about two minutes. Your exact address stays private.</p>
      </div>
      <DonateForm userId={user.id} initialLocation={initialLocation} organizations={organizations ?? []} />
    </div>
  )
}
