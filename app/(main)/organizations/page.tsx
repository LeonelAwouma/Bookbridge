import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, Plus, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Organizations — BookBridge' }

export default async function OrganizationsPage() {
  const supabase = await createClient()
  const { data: organizations } = await supabase.from('organizations').select('*').order('created_at', { ascending: false }).limit(60)

  return (
    <div className="content-section">
      <div className="section-heading">
        <div>
          <div className="eyebrow">Partner network</div>
          <h1 className="font-serif text-4xl">Organizations</h1>
          <p>Schools, universities, libraries, and NGOs building access to books.</p>
        </div>
        <Link href="/organizations/new">
          <Button>
            <Plus size={16} /> Create organization
          </Button>
        </Link>
      </div>

      {!organizations || organizations.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No organizations yet — be the first to create one.</p>
      ) : (
        <div className="book-grid mt-6">
          {organizations.map((org) => (
            <Link key={org.id} href={`/organizations/${org.id}`} className="book-card block p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-lg bg-muted text-sm font-semibold">{org.name.slice(0, 2).toUpperCase()}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{org.name}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin size={12} /> {org.city}, {org.country}
                  </p>
                </div>
                {org.verification_status === 'verified' && <ShieldCheck size={16} className="shrink-0 text-primary" />}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="secondary" className="capitalize">
                  {org.organization_type}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
