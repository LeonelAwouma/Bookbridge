import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, MapPin, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getNeeds } from '@/lib/supabase/needs-queries'
import { getCurrentUserAndProfile } from '@/lib/supabase/queries'

export const metadata: Metadata = { title: 'Book Requests — BookBridge' }

export default async function RequestsPage({ searchParams }: { searchParams: Promise<{ city?: string }> }) {
  const params = await searchParams
  const { profile } = await getCurrentUserAndProfile()
  const city = params.city || profile?.city || undefined

  const needs = await getNeeds({ city, limit: 60 })

  return (
    <div className="content-section">
      <div className="section-heading">
        <div>
          <div className="eyebrow">Make an impact</div>
          <h1 className="font-serif text-4xl">Books Needed Near You</h1>
          <p>{needs.length} open requests{city ? ` near ${city}` : ''}.</p>
        </div>
        <Link href="/requests/new">
          <Button>
            <Plus size={16} /> Post a request
          </Button>
        </Link>
      </div>

      {needs.length === 0 ? (
        <div className="map-view">
          <strong>No open requests {city ? `near ${city}` : ''} yet</strong>
          <span>Check back soon, or post one yourself.</span>
        </div>
      ) : (
        <div className="needs-grid mt-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          {needs.map((need) => {
            const label = need.organizationName ?? need.requesterName ?? 'BookBridge community'
            return (
              <Link href={`/requests/${need.id}`} className="need-card" key={need.id}>
                <div className="flex items-center justify-between">
                  <div className="need-icon">{need.title.slice(0, 2).toUpperCase()}</div>
                  {need.priority === 'high' && <Badge variant="destructive">Urgent</Badge>}
                </div>
                <h3>{need.title}</h3>
                <p>
                  <MapPin size={14} /> {need.neighborhood ? `${need.neighborhood}, ` : ''}
                  {need.city}
                </p>
                <p className="muted -mt-3 mb-4">{label}</p>
                <div className="need-bottom">
                  <span>{need.quantity_needed - need.quantity_fulfilled} books needed</span>
                  <span>
                    I can help <ArrowRight size={15} />
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
