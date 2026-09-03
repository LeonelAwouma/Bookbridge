import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { getMyNeeds, getMyRequests } from '@/lib/supabase/dashboard-queries'
import { ReviewDialog } from '@/components/dashboard/review-dialog'
import { getServerTranslator } from '@/lib/i18n/server'

export const metadata: Metadata = { title: 'My Requests — BookBridge' }

export default async function MyRequestsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/dashboard/requests')

  const { dict, t } = await getServerTranslator()
  const [requests, needs] = await Promise.all([getMyRequests(user.id), getMyNeeds(user.id)])

  const acceptedIds = requests.filter((r) => r.status === 'accepted' || r.status === 'completed').map((r) => r.id)
  const { data: conversations } = acceptedIds.length
    ? await supabase.from('conversations').select('id, donation_request_id').in('donation_request_id', acceptedIds)
    : { data: [] }
  const conversationByRequest = new Map((conversations ?? []).map((c) => [c.donation_request_id, c.id]))

  const { data: bookRows } = requests.length ? await supabase.from('books').select('id, donor_id').in('id', requests.map((r) => r.book_id)) : { data: [] }
  const ownerByBook = new Map((bookRows ?? []).map((b) => [b.id, b.donor_id]))

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <h1 className="font-serif text-3xl">{t('dashboard.myRequestsTitle')}</h1>

      <section className="mt-6">
        <h2 className="font-serif text-xl">{t('dashboard.myRequestsHeading')}</h2>
        {requests.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">{t('dashboard.noRequestsMade')}</p>
        ) : (
          <ul className="mt-3 flex flex-col divide-y divide-border rounded-lg border border-border">
            {requests.map((r) => {
              const conversationId = conversationByRequest.get(r.id)
              const ownerId = ownerByBook.get(r.book_id)
              return (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm">
                  <div>
                    <Link href={`/books/${r.book_id}`} className="font-medium hover:underline">
                      {r.book?.title ?? 'Book'}
                    </Link>
                    <p className="text-xs text-muted-foreground">{t('dashboard.requestedOn', { date: new Date(r.created_at).toLocaleDateString() })}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{dict.requestStatus[r.status]}</Badge>
                    {conversationId && (
                      <Link href={`/messages/${conversationId}`} className="text-xs text-primary hover:underline">
                        {t('dashboard.message')}
                      </Link>
                    )}
                    {r.status === 'completed' && ownerId && <ReviewDialog donationRequestId={r.id} revieweeId={ownerId} revieweeName={t('dashboard.theDonor')} />}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl">{t('dashboard.requestsPostedHeading')}</h2>
          <Link href="/requests/new" className="text-sm text-primary hover:underline">
            {t('dashboard.newRequest')}
          </Link>
        </div>
        {needs.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">{t('dashboard.noNeedsPosted')}</p>
        ) : (
          <ul className="mt-3 flex flex-col divide-y divide-border rounded-lg border border-border">
            {needs.map((n) => (
              <li key={n.id} className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm">
                <Link href={`/requests/${n.id}`} className="font-medium hover:underline">
                  {n.title}
                </Link>
                <Badge variant="secondary">{dict.needStatus[n.status]}</Badge>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
