import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CampaignForm } from '@/components/campaigns/campaign-form'
import { getServerTranslator } from '@/lib/i18n/server'

export const metadata: Metadata = { title: 'Start a Campaign — BookBridge' }

export default async function NewCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/organizations/${id}/campaigns/new`)

  const { data: organization } = await supabase.from('organizations').select('id, owner_id, country, city').eq('id', id).single()
  if (!organization) notFound()
  if (organization.owner_id !== user.id) redirect(`/organizations/${id}`)

  const { t } = await getServerTranslator()

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <div className="mb-8">
        <p className="eyebrow">BookBridge</p>
        <h1 className="mt-2 font-serif text-3xl sm:text-4xl">{t('campaigns.startTitle')}</h1>
      </div>
      <CampaignForm organization={organization} />
    </div>
  )
}
