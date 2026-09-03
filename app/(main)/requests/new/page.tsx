import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NeedForm } from '@/components/needs/need-form'
import { emptyLocation } from '@/components/location/location-picker'
import { getServerTranslator } from '@/lib/i18n/server'

export const metadata: Metadata = { title: 'Post a Book Request — BookBridge' }

export default async function NewRequestPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/requests/new')

  const { t } = await getServerTranslator()

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
        <h1 className="mt-2 font-serif text-3xl sm:text-4xl">{t('needs.pageTitle')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('needs.pageSubtitle')}</p>
      </div>
      <NeedForm initialLocation={initialLocation} organizations={organizations ?? []} />
    </div>
  )
}
