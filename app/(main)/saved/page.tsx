import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Bookmark } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getBooks } from '@/lib/supabase/books-queries'
import { BookCard } from '@/components/books/book-card'
import { getServerTranslator } from '@/lib/i18n/server'

export const metadata: Metadata = { title: 'Saved Books — BookBridge' }

export default async function SavedBooksPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/saved')

  const { t } = await getServerTranslator()
  const { data: saved } = await supabase.from('saved_books').select('book_id').eq('profile_id', user.id)
  const ids = (saved ?? []).map((s) => s.book_id)
  const books = ids.length ? await getBooks({ ids, status: ['available', 'requested', 'reserved', 'completed', 'cancelled'], limit: 60 }) : []

  return (
    <div className="content-section">
      <h1 className="font-serif text-4xl">{t('books.savedBooksTitle')}</h1>
      {books.length === 0 ? (
        <div className="map-view mt-6">
          <Bookmark size={28} />
          <strong>{t('books.noSavedBooks')}</strong>
          <span>{t('books.noSavedBooksHint')}</span>
        </div>
      ) : (
        <div className="book-grid mt-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} canSave saved />
          ))}
        </div>
      )}
    </div>
  )
}
