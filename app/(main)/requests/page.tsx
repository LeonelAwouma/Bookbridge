import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, MapPin, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getNeeds } from '@/lib/supabase/needs-queries'
import { getCurrentUserAndProfile } from '@/lib/supabase/queries'
import { getServerTranslator } from '@/lib/i18n/server'

export const metadata: Metadata = { title: 'Book Requests — BookBridge' }

export default async function RequestsPage({ searchParams }: { searchParams: Promise<{ city?: string }> }) {
  const params = await searchParams
  const { profile } = await getCurrentUserAndProfile()
  const city = params.city || profile?.city || undefined
  const { t } = await getServerTranslator()

  const needs = await getNeeds({ city, limit: 60 })

  return (
    <div className="content-section">
      <div className="section-heading">
        <div>
          <div className="eyebrow">{t('home.impactEyebrow')}</div>
          <h1 className="font-serif text-4xl">{t('needs.feedTitle')}</h1>
          <p>{city ? t('needs.feedSubtitle', { count: needs.length, city }) : t('books.booksAvailable', { count: needs.length })}</p>
        </div>
        <Link href="/requests/new">
          <Button>
            <Plus size={16} /> {t('needs.postARequest')}
          </Button>
        </Link>
      </div>

      {needs.length === 0 ? (
        <div className="map-view">
          <strong>{t('needs.noOpenRequestsNear', { city: city ?? '' })}</strong>
          <span>{t('needs.noOpenRequestsHint')}</span>
        </div>
      ) : (
        <div className="needs-grid mt-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          {needs.map((need) => {
            const label = need.organizationName ?? need.requesterName ?? 'BookBridge'
            return (
              <Link href={`/requests/${need.id}`} className="need-card" key={need.id}>
                <div className="flex items-center justify-between">
                  <div className="need-icon">{need.title.slice(0, 2).toUpperCase()}</div>
                  {need.priority === 'high' && <Badge variant="destructive">{t('needs.urgent')}</Badge>}
                </div>
                <h3>{need.title}</h3>
                <p>
                  <MapPin size={14} /> {need.neighborhood ? `${need.neighborhood}, ` : ''}
                  {need.city}
                </p>
                <p className="muted -mt-3 mb-4">{label}</p>
                <div className="need-bottom">
                  <span>
                    {need.quantity_needed - need.quantity_fulfilled} {t('needs.booksNeededLabel')}
                  </span>
                  <span>
                    {t('home.iCanHelp')} <ArrowRight size={15} />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
