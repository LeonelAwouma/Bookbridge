import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Mail, MapPin, Phone, ShieldCheck, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { BackButton } from '@/components/ui/back-button'
import { createClient } from '@/lib/supabase/server'
import { getBooks } from '@/lib/supabase/books-queries'
import { getNeeds } from '@/lib/supabase/needs-queries'
import { BookCard } from '@/components/books/book-card'
import { VerificationRequestButton } from '@/components/organizations/verification-request-button'
import { getServerTranslator } from '@/lib/i18n/server'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: org } = await supabase.from('organizations').select('name').eq('id', id).single()
  return { title: org ? `${org.name} — BookBridge` : 'Organization — BookBridge' }
}

export default async function OrganizationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: org } = await supabase.from('organizations').select('*').eq('id', id).single()
  if (!org) notFound()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isOwner = user?.id === org.owner_id
  const { dict, t } = await getServerTranslator()

  const [books, needs, { data: campaigns }] = await Promise.all([
    getBooks({ organizationId: org.id, status: ['available', 'requested', 'reserved', 'completed'], limit: 12 }),
    getNeeds({ organizationId: org.id, status: ['open', 'partially_fulfilled', 'fulfilled', 'closed'], limit: 6 }),
    supabase.from('campaigns').select('*').eq('organization_id', org.id).order('created_at', { ascending: false }),
  ])

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <BackButton className="mb-6" fallbackHref="/organizations" />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-xl bg-muted text-lg font-semibold">{org.name.slice(0, 2).toUpperCase()}</div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-3xl">{org.name}</h1>
              {org.verification_status === 'verified' && <ShieldCheck size={20} className="text-primary" />}
            </div>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin size={13} /> {org.city}, {org.country}
            </p>
            <Badge variant="secondary" className="mt-1">
              {dict.userTypes[org.organization_type]}
            </Badge>
          </div>
        </div>
        {isOwner && org.verification_status === 'unverified' && <VerificationRequestButton organizationId={org.id} />}
        {isOwner && org.verification_status === 'pending' && <Badge variant="outline">{t('verificationStatus.pending')}</Badge>}
      </div>

      {org.description && <p className="mt-6 max-w-2xl text-sm leading-relaxed">{org.description}</p>}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border p-4">
          <p className="font-serif text-2xl">{org.books_received_count}</p>
          <p className="text-xs text-muted-foreground">{t('organizations.booksReceived')}</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="font-serif text-2xl">{org.students_supported_count}</p>
          <p className="text-xs text-muted-foreground">{t('organizations.studentsSupported')}</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="font-serif text-2xl">{needs.length}</p>
          <p className="text-xs text-muted-foreground">{t('organizations.activeRequests')}</p>
        </div>
      </div>

      {(org.contact_person || org.contact_email || org.contact_phone) && (
        <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
          {org.contact_person && (
            <span className="flex items-center gap-1">
              <User size={14} /> {org.contact_person}
            </span>
          )}
          {org.contact_email && (
            <span className="flex items-center gap-1">
              <Mail size={14} /> {org.contact_email}
            </span>
          )}
          {org.contact_phone && (
            <span className="flex items-center gap-1">
              <Phone size={14} /> {org.contact_phone}
            </span>
          )}
        </div>
      )}

      {(isOwner || (campaigns && campaigns.length > 0)) && (
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl">{t('organizations.campaigns')}</h2>
            {isOwner && (
              <Link href={`/organizations/${org.id}/campaigns/new`} className="text-sm text-primary hover:underline">
                {t('organizations.startCampaign')}
              </Link>
            )}
          </div>
          <div className="mt-3 flex flex-col gap-3">
            {(campaigns ?? []).map((c) => {
              const progress = Math.min(100, Math.round((c.collected_quantity / c.goal_quantity) * 100))
              return (
                <Link key={c.id} href={`/campaigns/${c.id}`} className="rounded-lg border border-border p-4 hover:bg-muted">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{c.title}</p>
                    <span className="text-xs text-muted-foreground">{progress}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t('campaigns.booksOfGoal', { collected: c.collected_quantity, goal: c.goal_quantity })}
                  </p>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {needs.length > 0 && (
        <section className="mt-10">
          <h2 className="font-serif text-xl">{t('organizations.booksNeeded')}</h2>
          <div className="needs-grid mt-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
            {needs.map((n) => (
              <Link key={n.id} href={`/requests/${n.id}`} className="need-card">
                <h3>{n.title}</h3>
                <p>
                  {n.quantity_needed - n.quantity_fulfilled} {t('needs.booksNeededLabel')}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {books.length > 0 && (
        <section className="mt-10">
          <h2 className="font-serif text-xl">{t('organizations.booksShared')}</h2>
          <div className="book-grid mt-3">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
