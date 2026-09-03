import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OrganizationForm } from '@/components/organizations/organization-form'
import { emptyLocation } from '@/components/location/location-picker'
import { getServerTranslator } from '@/lib/i18n/server'
import type { OrganizationType, UserType } from '@/lib/supabase/types'

export const metadata: Metadata = { title: 'Create an Organization — BookBridge' }

const orgUserTypes: UserType[] = ['school', 'university', 'library', 'ngo', 'association', 'company']

export default async function NewOrganizationPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/organizations/new')

  const { t } = await getServerTranslator()

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type, country, region, city, neighborhood, latitude, longitude')
    .eq('id', user.id)
    .single()

  const initialLocation = {
    country: profile?.country ?? emptyLocation.country,
    region: profile?.region ?? emptyLocation.region,
    city: profile?.city ?? emptyLocation.city,
    neighborhood: profile?.neighborhood ?? emptyLocation.neighborhood,
    latitude: profile?.latitude ?? null,
    longitude: profile?.longitude ?? null,
  }

  const defaultType: OrganizationType = profile?.user_type && orgUserTypes.includes(profile.user_type) ? (profile.user_type as OrganizationType) : 'school'

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <div className="mb-8">
        <p className="eyebrow">BookBridge</p>
        <h1 className="mt-2 font-serif text-3xl sm:text-4xl">{t('organizations.createTitle')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('organizations.createSubtitle')}</p>
      </div>
      <OrganizationForm initialLocation={initialLocation} defaultType={defaultType} />
    </div>
  )
}
