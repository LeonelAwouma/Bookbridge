'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import Link from 'next/link'
import 'leaflet/dist/leaflet.css'
import type { BookWithExtras } from '@/lib/supabase/books-queries'

const dotIcon = L.divIcon({
  className: '',
  html: '<span style="display:block;width:14px;height:14px;border-radius:50%;background:#e56b4c;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.4)"></span>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
})

export function BooksMapInner({ books, center }: { books: BookWithExtras[]; center: [number, number] }) {
  const points = books.filter((b) => b.approx_latitude && b.approx_longitude)

  return (
    <MapContainer center={center} zoom={11} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((book) => (
        <Marker key={book.id} position={[book.approx_latitude!, book.approx_longitude!]} icon={dotIcon}>
          <Popup>
            <Link href={`/books/${book.id}`} className="font-medium text-primary">
              {book.title}
            </Link>
            <br />
            <span className="text-xs">
              {book.neighborhood ? `${book.neighborhood}, ` : ''}
              {book.city}
            </span>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
