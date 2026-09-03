import type { Metadata } from 'next'
import Link from 'next/link'
import { List, Map as MapIcon, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BookCard } from '@/components/books/book-card'
import { BooksMap } from '@/components/books/books-map'
import { getBooks } from '@/lib/supabase/books-queries'
import { getCurrentUserAndProfile } from '@/lib/supabase/queries'
import { categoryOptions, conditionOptions, educationLevelOptions, languageOptions } from '@/lib/data/taxonomy'
import { majorCities } from '@/lib/data/locations'
import { distanceKm } from '@/lib/geo'
import type { BookCategory, BookCondition, EducationLevel } from '@/lib/supabase/types'

export const metadata: Metadata = { title: 'Find Books — BookBridge' }

interface SearchParams {
  q?: string
  category?: string
  level?: string
  language?: string
  condition?: string
  source?: string
  city?: string
  view?: string
}

export default async function BooksPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const { profile } = await getCurrentUserAndProfile()

  const city = params.city || profile?.city || undefined
  const view = params.view === 'map' ? 'map' : 'list'

  const clean = (value?: string) => (value && value !== 'all' ? value : undefined)

  const books = await getBooks({
    search: params.q,
    category: clean(params.category) as BookCategory | undefined,
    educationLevel: clean(params.level) as EducationLevel | undefined,
    language: clean(params.language),
    condition: clean(params.condition) as BookCondition | undefined,
    source: clean(params.source) as 'individual' | 'organization' | undefined,
    city,
    limit: 60,
  })

  const cityCenter = majorCities.find((c) => c.city === city) ?? majorCities[0]

  function buildHref(overrides: Record<string, string | undefined>) {
    const next = new URLSearchParams()
    const merged = { ...params, ...overrides }
    for (const [key, value] of Object.entries(merged)) {
      if (value) next.set(key, value)
    }
    const qs = next.toString()
    return qs ? `/books?${qs}` : '/books'
  }

  return (
    <div className="content-section">
      <div className="section-heading">
        <div>
          <div className="eyebrow">Discover & share</div>
          <h1 className="font-serif text-4xl">Find books</h1>
          <p>{books.length} books available{city ? ` near ${city}` : ''}.</p>
        </div>
      </div>

      <form method="get" className="mt-6 flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="search-box flex-1">
            <Search size={18} />
            <input name="q" defaultValue={params.q} placeholder="Search by title, author, or subject" />
          </label>
          <Input name="city" defaultValue={city} placeholder="City" className="sm:w-48" />
          <Button type="submit">Search</Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterSelect name="category" label="Category" value={params.category} options={categoryOptions} />
          <FilterSelect name="level" label="Education level" value={params.level} options={educationLevelOptions} />
          <FilterSelect name="language" label="Language" value={params.language} options={languageOptions.map((l) => ({ value: l.code, label: l.label }))} />
          <FilterSelect name="condition" label="Condition" value={params.condition} options={conditionOptions} />
          <FilterSelect
            name="source"
            label="Donor type"
            value={params.source}
            options={[
              { value: 'individual', label: 'Individuals' },
              { value: 'organization', label: 'Organizations' },
            ]}
          />
        </div>
        {params.view && <input type="hidden" name="view" value={params.view} />}
      </form>
      <p className="mt-1 text-[11px] text-muted-foreground">Filters apply on submit — press Search after changing them.</p>

      <div className="explore-toolbar mt-4">
        <div />
        <div className="view-toggle">
          <Link href={buildHref({ view: undefined })} className={view === 'list' ? 'selected' : ''}>
            <List size={17} /> List
          </Link>
          <Link href={buildHref({ view: 'map' })} className={view === 'map' ? 'selected' : ''}>
            <MapIcon size={17} /> Map
          </Link>
        </div>
      </div>

      {books.length === 0 ? (
        <div className="map-view">
          <strong>No books match yet</strong>
          <span>Try a different city or clear some filters — or check back soon.</span>
        </div>
      ) : view === 'map' ? (
        <BooksMap books={books} center={[cityCenter.lat, cityCenter.lng]} />
      ) : (
        <div className="book-grid">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              canSave={!!profile}
              distanceKm={
                profile?.approx_latitude && profile?.approx_longitude && book.approx_latitude && book.approx_longitude
                  ? distanceKm(profile.approx_latitude, profile.approx_longitude, book.approx_latitude, book.approx_longitude)
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FilterSelect({
  name,
  label,
  value,
  options,
}: {
  name: string
  label: string
  value?: string
  options: { value: string; label: string }[]
}) {
  return (
    <Select name={name} defaultValue={value || 'all'}>
      <SelectTrigger className="text-xs">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{label}: all</SelectItem>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
