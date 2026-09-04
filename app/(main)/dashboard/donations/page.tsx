import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { getMyBooksWithRequests } from '@/lib/supabase/dashboard-queries'
import { RequestActions } from '@/components/dashboard/request-actions'
import { ReviewDialog } from '@/components/dashboard/review-dialog'
import { WithdrawBookButton } from '@/components/dashboard/withdraw-book-button'
import { BackButton } from '@/components/ui/back-button'
import { getServerTranslator } from '@/lib/i18n/server'

export const metadata: Metadata = { title: 'My Donations — BookBridge' }

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  available: 'secondary',
  requested: 'default',
  reserved: 'default',
  completed: 'outline',
  cancelled: 'destructive',
}

export default async function MyDonationsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/dashboard/donations')

  const { dict, t } = await getServerTranslator()
  const items = await getMyBooksWithRequests(user.id)

  const requestIds = items.flatMap((i) => i.requests.filter((r) => r.status === 'accepted' || r.status === 'completed').map((r) => r.id))
  const { data: conversations } = requestIds.length
    ? await supabase.from('conversations').select('id, donation_request_id').in('donation_request_id', requestIds)
    : { data: [] }
  const conversationByRequest = new Map((conversations ?? []).map((c) => [c.donation_request_id, c.id]))

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <BackButton className="mb-6" fallbackHref="/dashboard" />
      <h1 className="font-serif text-3xl">{t('dashboard.myDonationsTitle')}</h1>

      {items.length === 0 ? (
        <div className="map-view mt-6">
          <strong>{t('dashboard.noDonationsYet')}</strong>
          <Link href="/donate" className="button button-primary mt-3">
            {t('dashboard.donateFirstBook')}
          </Link>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {items.map(({ book, requests }) => (
            <div key={book.id} className="rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link href={`/books/${book.id}`} className="font-medium hover:underline">
                  {book.title}
                </Link>
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariant[book.status]}>{dict.bookStatus[book.status]}</Badge>
                  {(book.status === 'available' || book.status === 'requested' || book.status === 'reserved') && (
                    <>
                      <Link href={`/donate/${book.id}/edit`} className="text-xs font-medium text-primary hover:underline">
                        {t('common.edit')}
                      </Link>
                      <WithdrawBookButton bookId={book.id} />
                    </>
                  )}
                </div>
              </div>
              {requests.length === 0 ? (
                <p className="mt-2 text-xs text-muted-foreground">{t('dashboard.noRequestsForBook')}</p>
              ) : (
                <ul className="mt-3 flex flex-col gap-3">
                  {requests.map((r) => (
                    <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-sm">
                      <div>
                        <p className="font-medium">{r.requesterName}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.quantity_requested} {r.quantity_requested > 1 ? dict.dashboard.shareImpactBooks : dict.dashboard.shareImpactBook} ·{' '}
                          {dict.requestStatus[r.status]}
                        </p>
                        {r.message && <p className="mt-1 text-xs text-muted-foreground">&ldquo;{r.message}&rdquo;</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <RequestActions requestId={r.id} status={r.status} conversationId={conversationByRequest.get(r.id)} />
                        {r.status === 'completed' && <ReviewDialog donationRequestId={r.id} revieweeId={r.requester_id} revieweeName={r.requesterName} />}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
