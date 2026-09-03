import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Campaigns — BookBridge' }

export default async function CampaignsPage() {
  const supabase = await createClient()
  const { data: campaigns } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false }).limit(60)

  return (
    <div className="content-section">
      <div className="section-heading">
        <div>
          <div className="eyebrow">Collective impact</div>
          <h1 className="font-serif text-4xl">Donation campaigns</h1>
          <p>Organizations rallying their community around a shared goal.</p>
        </div>
      </div>

      {!campaigns || campaigns.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No campaigns yet. Organizations can start one from their profile.</p>
      ) : (
        <div className="needs-grid mt-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {campaigns.map((c) => {
            const progress = Math.min(100, Math.round((c.collected_quantity / c.goal_quantity) * 100))
            return (
              <Link key={c.id} href={`/campaigns/${c.id}`} className="need-card">
                <h3>{c.title}</h3>
                <p>
                  <MapPin size={14} /> {c.city}, {c.country}
                </p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                </div>
                <div className="need-bottom">
                  <span>
                    {c.collected_quantity} / {c.goal_quantity} books
                  </span>
                  <span>{progress}%</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
