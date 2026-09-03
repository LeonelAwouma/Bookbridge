import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { BookOpen, MapPin, PackageCheck, ShieldCheck, Truck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getBookById } from '@/lib/supabase/books-queries'
import { createClient } from '@/lib/supabase/server'
import { categoryLabel, conditionLabel, educationLevelLabel } from '@/lib/data/taxonomy'
import { getServerTranslator } from '@/lib/i18n/server'
import { RequestBookDialog } from '@/components/books/request-book-dialog'
import { ReportButton } from '@/components/trust/report-button'
import { DonationConfirmationToast } from '@/components/books/donation-confirmation-toast'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const book = await getBookById(id)
  return { title: book ? `${book.title} — BookBridge` : 'Book — BookBridge' }
}

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const book = await getBookById(id)
  if (!book) notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isOwner = user ? (book.donor_id === user.id || (book.organization_id && (await isOrgOwner(user.id, book.organization_id)))) : false
  const canRequest = !!user && !isOwner && ['available', 'requested'].includes(book.status)
  const donorLabel = book.organizationName ?? book.donorName ?? 'BookBridge'
  const { dict, t } = await getServerTranslator()

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <Suspense>
        <DonationConfirmationToast />
      </Suspense>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <div className="aspect-[4/3] overflow-hidden rounded-xl bg-muted ring-1 ring-border relative">
            {book.images[0] ? (
              <Image src={book.images[0]} alt={book.title} fill className="object-cover" sizes="(min-width: 768px) 500px, 100vw" priority />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <BookOpen size={48} />
              </div>
            )}
          </div>
          {book.images.length > 1 && (
            <div className="flex gap-2">
              {book.images.slice(1, 5).map((url) => (
                <div key={url} className="relative size-16 overflow-hidden rounded-lg ring-1 ring-border">
                  <Image src={url} alt="" fill className="object-cover" sizes="64px" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="secondary">{categoryLabel(dict, book.category)}</Badge>
              <Badge variant="secondary">{educationLevelLabel(dict, book.education_level)}</Badge>
              {book.organizationVerified && (
                <Badge className="gap-1">
                  <ShieldCheck size={12} /> {t('books.verifiedOrganization')}
                </Badge>
              )}
            </div>
            <h1 className="mt-3 font-serif text-3xl">{book.title}</h1>
            {book.author && <p className="text-muted-foreground">{book.author}</p>}
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-muted text-xs font-semibold">
              {donorLabel.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{donorLabel}</p>
              <p className="text-xs text-muted-foreground">
                {book.donorRating ? `★ ${book.donorRating.toFixed(1)}` : t('books.newDonor')}
              </p>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">{t('common.condition')}</dt>
              <dd>{conditionLabel(dict, book.condition)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">{t('books.quantityAvailable')}</dt>
              <dd>{book.quantity_available}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">{t('common.language')}</dt>
              <dd className="capitalize">{book.language}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">{t('common.location')}</dt>
              <dd className="flex items-center gap-1">
                <MapPin size={13} /> {book.neighborhood ? `${book.neighborhood}, ` : ''}
                {book.city}
              </dd>
            </div>
          </dl>

          <div className="flex gap-4 text-xs text-muted-foreground">
            {book.pickup_available && (
              <span className="flex items-center gap-1">
                <PackageCheck size={14} /> {t('books.pickupAvailable')}
              </span>
            )}
            {book.dropoff_available && (
              <span className="flex items-center gap-1">
                <Truck size={14} /> {t('books.dropoffAvailable')}
              </span>
            )}
          </div>

          {book.description && <p className="text-sm leading-relaxed">{book.description}</p>}

          <div className="mt-2 flex flex-col gap-3">
            {canRequest && <RequestBookDialog bookId={book.id} maxQuantity={book.quantity_available || 1} bookTitle={book.title} />}
            {isOwner && (
              <Link href="/dashboard/donations" className="text-sm font-medium text-primary hover:underline">
                {t('books.manageRequestsLink')}
              </Link>
            )}
            {!user && (
              <Link href={`/login?next=/books/${book.id}`} className="text-sm font-medium text-primary hover:underline">
                {t('books.loginToRequest')}
              </Link>
            )}
            {user && !isOwner && <ReportButton targetType="book" targetId={book.id} />}
          </div>

          <div className="rounded-lg bg-sage/40 p-3 text-xs text-muted-foreground" style={{ background: 'var(--sage)' }}>
            <strong className="block text-foreground">{t('books.meetSafelyTitle')}</strong>
            {t('books.meetSafelyBody')}
          </div>
        </div>
      </div>
    </div>
  )
}

async function isOrgOwner(userId: string, organizationId: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('organizations').select('id').eq('id', organizationId).eq('owner_id', userId).maybeSingle()
  return !!data
}
