import type { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DonateForm } from '@/components/donate/donate-form'
import { getServerTranslator } from '@/lib/i18n/server'

export const metadata: Metadata = {
  title: 'Edit listing — BookBridge',
}

export default async function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(`/login?next=/donate/${id}/edit`)

  const { t } = await getServerTranslator()

  const { data: book } = await supabase.from('books').select('*').eq('id', id).maybeSingle()
  if (!book) notFound()

  const [{ data: organizations }, { data: images }] = await Promise.all([
    supabase.from('organizations').select('id, name').eq('owner_id', user.id),
    supabase.from('book_images').select('id, url').eq('book_id', id).order('position'),
  ])

  const isOwner = book.donor_id === user.id || (organizations ?? []).some((o) => o.id === book.organization_id)
  if (!isOwner) redirect(`/books/${id}`)
  if (book.status === 'completed' || book.status === 'cancelled') redirect(`/books/${id}`)

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <div className="mb-8">
        <p className="eyebrow">BookBridge</p>
        <h1 className="mt-2 font-serif text-3xl sm:text-4xl">{t('donate.editTitle')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('donate.editSubtitle')}</p>
      </div>
      <DonateForm
        userId={user.id}
        initialLocation={{
          country: book.country,
          region: book.region ?? '',
          city: book.city,
          neighborhood: book.neighborhood ?? '',
          latitude: book.latitude,
          longitude: book.longitude,
        }}
        organizations={organizations ?? []}
        editBook={{
          id: book.id,
          title: book.title,
          author: book.author,
          isbn: book.isbn,
          category: book.category,
          subject: book.subject,
          educationLevel: book.education_level,
          language: book.language,
          condition: book.condition,
          quantity: book.quantity,
          description: book.description,
          pickupAvailable: book.pickup_available,
          dropoffAvailable: book.dropoff_available,
        }}
        existingImages={images ?? []}
      />
    </div>
  )
}
