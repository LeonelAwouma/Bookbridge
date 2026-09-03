'use client'

import dynamic from 'next/dynamic'
import type { BookWithExtras } from '@/lib/supabase/books-queries'

const BooksMapInner = dynamic(() => import('./books-map-inner').then((m) => m.BooksMapInner), {
  ssr: false,
  loading: () => <div className="map-view">Loading map…</div>,
})

export function BooksMap({ books, center }: { books: BookWithExtras[]; center: [number, number] }) {
  return (
    <div className="overflow-hidden rounded-xl" style={{ height: 420 }}>
      <BooksMapInner books={books} center={center} />
    </div>
  )
}
