import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CalendarClock, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { categoryLabel } from '@/lib/data/taxonomy'
import { getServerTranslator } from '@/lib/i18n/server'
import { DonateToCampaignDialog } from '@/components/campaigns/donate-to-campaign-dialog'
import { BackButton } from '@/components/ui/back-button'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: campaign } = await supabase.from('campaigns').select('title').eq('id', id).single()
  return { title: campaign ? `${campaign.title} — BookBridge` : 'Campaign — BookBridge' }
}

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: campaign } = await supabase.from('campaigns').select('*').eq('id', id).single()
  if (!campaign) notFound()

  const { data: organization } = await supabase.from('organizations').select('id, name, verification_status').eq('id', campaign.organization_id).single()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { dict, t } = await getServerTranslator()

  const progress = Math.min(100, Math.round((campaign.collected_quantity / campaign.goal_quantity) * 100))

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <BackButton className="mb-6" fallbackHref="/campaigns" />
      <div className="eyebrow">{t('campaigns.campaignEyebrow')}</div>
      <h1 className="mt-2 font-serif text-4xl">{campaign.title}</h1>
      {organization && (
        <p className="mt-1 text-sm text-muted-foreground">
          {t('campaigns.organizedByPrefix')}{' '}
          <Link href={`/organizations/${organization.id}`} className="text-primary hover:underline">
            {organization.name}
          </Link>
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin size={14} /> {campaign.city}, {campaign.country}
        </span>
        {campaign.deadline && (
          <span className="flex items-center gap-1">
            <CalendarClock size={14} /> {new Date(campaign.deadline).toLocaleDateString()}
          </span>
        )}
        {campaign.category && <span>{categoryLabel(dict, campaign.category)}</span>}
      </div>

      <div className="mt-6">
        <div className="h-3 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-sm">{t('campaigns.booksCollected', { collected: campaign.collected_quantity, goal: campaign.goal_quantity, progress })}</p>
      </div>

      {campaign.description && <p className="mt-6 text-sm leading-relaxed">{campaign.description}</p>}

      <div className="mt-8">
        {campaign.status === 'active' ? (
          user ? (
            <DonateToCampaignDialog campaignId={campaign.id} />
          ) : (
            <Link href={`/login?next=/campaigns/${campaign.id}`} className="button button-primary">
              {t('campaigns.loginToDonate')}
            </Link>
          )
        ) : (
          <p className="text-sm font-medium text-primary">{t('campaigns.goalReached')}</p>
        )}
      </div>
    </div>
  )
}
