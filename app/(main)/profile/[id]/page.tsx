import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BookOpen, Calendar, MapPin, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { BackButton } from '@/components/ui/back-button'
import { createClient } from '@/lib/supabase/server'
import { getBooks } from '@/lib/supabase/books-queries'
import { BookCard } from '@/components/books/book-card'
import { userTypeLabel } from '@/lib/data/user-types'
import { getServerTranslator } from '@/lib/i18n/server'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', id).single()
  return { title: profile ? `${profile.full_name} — BookBridge` : 'Profile — BookBridge' }
}

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).single()
  if (!profile) notFound()

  const { dict, t } = await getServerTranslator()

  const [books, { data: achievements }] = await Promise.all([
    getBooks({ donorId: id, status: ['available', 'requested', 'reserved', 'completed'], limit: 8 }),
    supabase.from('user_achievements').select('achievement_id, achievements(title, icon)').eq('profile_id', id),
  ])

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <BackButton className="mb-6" fallbackHref="/" />
      <div className="flex items-center gap-4">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted text-lg font-semibold">
          {profile.full_name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 className="font-serif text-3xl">{profile.full_name}</h1>
          <p className="text-sm text-muted-foreground">{userTypeLabel(dict, profile.user_type)}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
        {profile.city && (
          <span className="flex items-center gap-1">
            <MapPin size={14} /> {profile.city}, {profile.country}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Calendar size={14} /> {t('profile.memberSince', { year: new Date(profile.created_at).getFullYear() })}
        </span>
        {profile.rating_count > 0 && (
          <span className="flex items-center gap-1">
            <Star size={14} className="fill-primary text-primary" /> {profile.rating_avg.toFixed(1)} ({profile.rating_count})
          </span>
        )}
      </div>

      {profile.bio && <p className="mt-4 max-w-xl text-sm leading-relaxed">{profile.bio}</p>}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border p-4">
          <p className="font-serif text-2xl">{profile.books_donated_count}</p>
          <p className="text-xs text-muted-foreground">{t('dashboard.booksDonated')}</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="font-serif text-2xl">{profile.people_supported_count}</p>
          <p className="text-xs text-muted-foreground">{t('dashboard.peopleSupported')}</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="font-serif text-2xl">{profile.books_received_count}</p>
          <p className="text-xs text-muted-foreground">{t('dashboard.booksReceived')}</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="font-serif text-2xl">{profile.donations_completed_count}</p>
          <p className="text-xs text-muted-foreground">{t('admin.completedDonations')}</p>
        </div>
      </div>

      {achievements && achievements.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {achievements.map((a) => (
            <Badge key={a.achievement_id} variant="secondary">
              {(a.achievements as unknown as { title: string })?.title}
            </Badge>
          ))}
        </div>
      )}

      {books.length > 0 && (
        <section className="mt-10">
          <h2 className="flex items-center gap-2 font-serif text-xl">
            <BookOpen size={18} /> {t('organizations.booksShared')}
          </h2>
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
