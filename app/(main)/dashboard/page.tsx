import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, BookMarked, Gift, Heart, Inbox, Star, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { userTypeLabels } from '@/lib/data/user-types'

export const metadata: Metadata = { title: 'Dashboard — BookBridge' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/dashboard')

  const [{ data: profile }, { data: organizations }, { data: myBooks }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('organizations').select('id, name, verification_status').eq('owner_id', user.id),
    supabase.from('books').select('id').eq('donor_id', user.id),
  ])

  if (!profile) redirect('/onboarding')

  const myBookIds = (myBooks ?? []).map((b) => b.id)
  const { count: pendingRequests } = myBookIds.length
    ? await supabase.from('donation_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending').in('book_id', myBookIds)
    : { count: 0 }

  const stats = [
    { label: 'Books donated', value: profile.books_donated_count, icon: Gift },
    { label: 'People supported', value: profile.people_supported_count, icon: Heart },
    { label: 'Books received', value: profile.books_received_count, icon: BookMarked },
    { label: 'Rating', value: profile.rating_count > 0 ? profile.rating_avg.toFixed(1) : '—', icon: Star },
  ]

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Welcome back</p>
          <h1 className="mt-1 font-serif text-3xl">{profile.full_name}</h1>
          <p className="text-sm text-muted-foreground">{userTypeLabels[profile.user_type]}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/donate" className="button button-primary">
            <Gift size={16} /> Donate books
          </Link>
          <Link href="/requests/new" className="button button-secondary">
            Post a request
          </Link>
        </div>
      </div>

      {!!pendingRequests && pendingRequests > 0 && (
        <Link
          href="/dashboard/donations"
          className="mt-6 flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm hover:bg-primary/10"
        >
          <Inbox size={18} className="text-primary" />
          <span>
            You have <strong>{pendingRequests}</strong> pending request{pendingRequests > 1 ? 's' : ''} waiting for a response.
          </span>
          <ArrowRight size={15} className="ml-auto" />
        </Link>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-border p-4">
            <s.icon size={16} className="text-primary" />
            <p className="mt-2 font-serif text-2xl">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link href="/dashboard/donations" className="rounded-lg border border-border p-5 hover:bg-muted">
          <Gift size={18} className="text-primary" />
          <h2 className="mt-2 font-medium">My donations</h2>
          <p className="text-sm text-muted-foreground">Manage your listings and respond to requests.</p>
        </Link>
        <Link href="/dashboard/requests" className="rounded-lg border border-border p-5 hover:bg-muted">
          <BookMarked size={18} className="text-primary" />
          <h2 className="mt-2 font-medium">My requests</h2>
          <p className="text-sm text-muted-foreground">Track books you've requested and needs you've posted.</p>
        </Link>
      </div>

      {organizations && organizations.length > 0 && (
        <div className="mt-8">
          <h2 className="font-serif text-xl">Your organizations</h2>
          <div className="mt-3 flex flex-col gap-2">
            {organizations.map((org) => (
              <Link key={org.id} href={`/organizations/${org.id}`} className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm hover:bg-muted">
                <Users size={16} /> {org.name}
                <span className="ml-auto text-xs text-muted-foreground">{org.verification_status}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
      {(!organizations || organizations.length === 0) && profile.user_type !== 'individual' && (
        <Link href="/organizations/new" className="mt-8 block rounded-lg border border-dashed border-border p-5 text-sm hover:bg-muted">
          Finish setting up your organization profile →
        </Link>
      )}
    </div>
  )
}
