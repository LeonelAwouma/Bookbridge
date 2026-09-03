import type { Metadata } from 'next'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { OrganizationVerificationActions } from '@/components/admin/organization-verification-actions'
import { getServerTranslator } from '@/lib/i18n/server'

export const metadata: Metadata = { title: 'Admin — Organizations — BookBridge' }

export default async function AdminOrganizationsPage() {
  const supabase = await createClient()
  const { data: organizations } = await supabase.from('organizations').select('*').order('created_at', { ascending: false }).limit(100)
  const { dict } = await getServerTranslator()

  return (
    <div className="flex flex-col gap-3">
      {(organizations ?? []).map((org) => (
        <div key={org.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4">
          <div>
            <Link href={`/organizations/${org.id}`} className="font-medium hover:underline">
              {org.name}
            </Link>
            <p className="text-xs text-muted-foreground">
              {dict.userTypes[org.organization_type]} · {org.city}, {org.country}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={org.verification_status === 'verified' ? 'default' : 'secondary'}>{dict.verificationStatus[org.verification_status]}</Badge>
            {org.verification_status !== 'verified' && <OrganizationVerificationActions organizationId={org.id} />}
          </div>
        </div>
      ))}
    </div>
  )
}
