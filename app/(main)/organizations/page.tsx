import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, Plus, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { getServerTranslator } from '@/lib/i18n/server'

export const metadata: Metadata = { title: 'Organizations — BookBridge' }

export default async function OrganizationsPage() {
  const supabase = await createClient()
  const { data: organizations } = await supabase.from('organizations').select('*').order('created_at', { ascending: false }).limit(60)
  const { dict, t } = await getServerTranslator()

  return (
    <div className="content-section">
      <div className="section-heading">
        <div>
          <div className="eyebrow">{t('nav.organizations')}</div>
          <h1 className="font-serif text-4xl">{t('organizations.directoryTitle')}</h1>
          <p>{t('organizations.directorySubtitle')}</p>
        </div>
        <Link href="/organizations/new">
          <Button>
            <Plus size={16} /> {t('organizations.createOrganization')}
          </Button>
        </Link>
      </div>

      {!organizations || organizations.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">{t('organizations.noOrganizationsYet')}</p>
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
                <Badge variant="secondary">{dict.userTypes[org.organization_type]}</Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
