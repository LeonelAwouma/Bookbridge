'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Bookmark, MapPin } from 'lucide-react'
import { toggleSavedBookAction } from '@/lib/actions/books'
import { categoryLabel, conditionLabel } from '@/lib/data/taxonomy'
import { useI18n } from '@/lib/i18n/provider'
import type { BookWithExtras } from '@/lib/supabase/books-queries'

const coverColors = ['plum', 'gold', 'sage', 'blue']

function coverColorFor(id: string) {
  const hash = id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return coverColors[hash % coverColors.length]
}

function initialsFor(title: string) {
  return title
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function BookCard({
  book,
  distanceKm,
  saved = false,
  canSave = false,
}: {
  book: BookWithExtras
  distanceKm?: number
  saved?: boolean
  canSave?: boolean
}) {
  const { t, dict } = useI18n()
  const [isSaved, setIsSaved] = useState(saved)
  const donorLabel = book.organizationName ?? book.donorName ?? 'BookBridge'

  async function toggleSave(e: React.MouseEvent) {
    e.preventDefault()
    setIsSaved((v) => !v)
    await toggleSavedBookAction(book.id, !isSaved)
  }

  return (
    <Link href={`/books/${book.id}`} className="book-card block">
      <div className={`book-cover ${coverColorFor(book.id)} relative overflow-hidden`}>
        {book.images[0] ? (
          <Image src={book.images[0]} alt={book.title} fill className="object-cover" sizes="280px" />
        ) : (
          <>
            <span>{initialsFor(book.title)}</span>
            <small>BOOKBRIDGE</small>
          </>
        )}
      </div>
      <div className="book-info">
        <div className="book-topline">
          <span className="tag">{categoryLabel(dict, book.category)}</span>
          {canSave && (
            <button className={`save-button ${isSaved ? 'saved' : ''}`} aria-label="Save book" onClick={toggleSave}>
              <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>
        <h3>{book.title}</h3>
        <p className="muted">{book.author || ' '}</p>
        <div className="card-meta">
          <span>
            <MapPin size={14} /> {book.neighborhood ? `${book.neighborhood}, ` : ''}
            {book.city}
          </span>
          <span>{distanceKm !== undefined ? `${distanceKm.toFixed(1)} km` : ''}</span>
        </div>
        <div className="card-footer">
          <span>
            <span className="mini-avatar">{donorLabel.slice(0, 2).toUpperCase()}</span>
            {conditionLabel(dict, book.condition)}
          </span>
          <span className="text-button">{t('books.request')}</span>
        </div>
      </div>
    </Link>
  )
}
