import Link from 'next/link'
import { ArrowRight, BookOpen, Gift, Heart, MapPin, Search, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { BookCard } from '@/components/books/book-card'
import { getBooks } from '@/lib/supabase/books-queries'
import { getCurrentUserAndProfile } from '@/lib/supabase/queries'
import { createClient } from '@/lib/supabase/server'
import { majorCities } from '@/lib/data/locations'

async function getPlatformStats() {
  const supabase = await createClient()
  const [{ count: books }, { count: donors }, { count: schools }] = await Promise.all([
    supabase.from('books').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).gt('donations_completed_count', 0),
    supabase.from('organizations').select('id', { count: 'exact', head: true }),
  ])
  return { books: books ?? 0, donors: donors ?? 0, schools: schools ?? 0 }
}

async function getNeedsNearby(city?: string) {
  const supabase = await createClient()
  let query = supabase.from('book_needs').select('*').eq('status', 'open').order('created_at', { ascending: false }).limit(3)
  if (city) query = query.eq('city', city)
  const { data } = await query
  return data ?? []
}

export default async function HomePage() {
  const { profile } = await getCurrentUserAndProfile()
  const city = profile?.city || majorCities[0].city

  const [books, stats, needs] = await Promise.all([getBooks({ city, limit: 8 }), getPlatformStats(), getNeedsNearby(city)])

  return (
    <main className="min-h-screen bg-background text-foreground" id="top">
      <section className="hero-shell">
        <div className="hero-copy">
          <div className="eyebrow">
            <Sparkles size={15} /> Give your books a second life
          </div>
          <h1>
            Give Your Books
            <br />a <em>Second Life</em>
          </h1>
          <p>Donate books you no longer use and help students, schools, and communities near you access education.</p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/donate">
              <Gift size={17} /> Donate Books
            </Link>
            <Link className="button button-secondary" href="/books">
              Find Books <ArrowRight size={17} />
            </Link>
          </div>
          <div className="social-proof">
            <div className="avatar-stack">
              <span>DA</span>
              <span>FK</span>
              <span>MO</span>
              <span>+</span>
            </div>
            <span>
              <strong>{stats.books}+</strong> books already donated
            </span>
          </div>
        </div>
        <div className="hero-art" aria-label="Illustration of books being passed between people">
          <div className="sun-disc" />
          <div className="book-stack">
            <span className="book-one">
              READ
              <br />
              MORE
            </span>
            <span className="book-two">
              SAVOIR
              <br />
              PARTAGER
            </span>
            <span className="book-three">
              SECOND
              <br />
              LIFE
            </span>
          </div>
          <div className="person person-left" />
          <div className="person person-right" />
          <div className="leaf leaf-one" />
          <div className="leaf leaf-two" />
          <span className="art-label">
            A small act
            <br />
            <strong>travels far.</strong>
          </span>
        </div>
      </section>

      <section className="impact-bar">
        <div>
          <strong>{stats.books}+</strong>
          <span>books donated</span>
        </div>
        <div>
          <strong>{stats.donors}+</strong>
          <span>active donors</span>
        </div>
        <div>
          <strong>{stats.schools}+</strong>
          <span>organizations supported</span>
        </div>
        <div className="impact-note">
          <Heart size={18} fill="currentColor" /> Every book makes a difference.
        </div>
      </section>

      <section id="explore" className="content-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">Discover & share</div>
            <h2>Books near {city}</h2>
            <p>Find your next read, or help one find its reader.</p>
          </div>
          <Link href="/books" className="text-button">
            See all books <ArrowRight size={15} />
          </Link>
        </div>
        {books.length === 0 ? (
          <div className="map-view">
            <MapPin size={28} />
            <strong>No books listed near {city} yet</strong>
            <span>Be the first to donate in your area.</span>
          </div>
        ) : (
          <div className="book-grid">
            {books.map((book) => (
              <BookCard key={book.id} book={book} canSave={!!profile} />
            ))}
          </div>
        )}
      </section>

      <section className="needs-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">Make an impact</div>
            <h2>Books Needed Near You</h2>
            <p>Somebody is waiting for the right book.</p>
          </div>
          <Link href="/requests" className="text-button">
            See all requests <ArrowRight size={15} />
          </Link>
        </div>
        {needs.length === 0 ? (
          <p className="muted">No open requests near {city} right now.</p>
        ) : (
          <div className="needs-grid">
            {needs.map((need) => (
              <Link href={`/requests/${need.id}`} className="need-card" key={need.id}>
                <div className="need-icon">{need.title.slice(0, 2).toUpperCase()}</div>
                <h3>{need.title}</h3>
                <p>
                  <MapPin size={14} /> {need.neighborhood ? `${need.neighborhood}, ` : ''}
                  {need.city}
                </p>
                <div className="need-bottom">
                  <span>{need.quantity_needed - need.quantity_fulfilled} books needed</span>
                  <span>
                    I can help <ArrowRight size={15} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section id="how-it-works" className="how-section">
        <div className="how-intro">
          <div className="eyebrow">Simple by design</div>
          <h2>
            One book.
            <br />
            <em>A world of difference.</em>
          </h2>
          <p>Whether you're sharing a book or looking for one, BookBridge keeps it simple, local, and human.</p>
        </div>
        <div className="steps">
          <div>
            <span>01</span>
            <Gift size={24} />
            <h3>List your books</h3>
            <p>Take a few photos and describe your books in under two minutes.</p>
          </div>
          <div>
            <span>02</span>
            <Search size={24} />
            <h3>Connect with someone nearby</h3>
            <p>Beneficiaries near you request the books they need.</p>
          </div>
          <div>
            <span>03</span>
            <Users size={24} />
            <h3>Give the books and create impact</h3>
            <p>Arrange a safe handover and track your impact.</p>
          </div>
        </div>
      </section>

      <section className="trust-section">
        <ShieldCheck size={28} />
        <div>
          <h2>Built on trust, one neighbor at a time.</h2>
          <p>Your privacy matters. We show neighborhoods, never exact addresses, and you're always in control of what you share.</p>
        </div>
        <Link href="/impact" className="button button-secondary">
          Our impact <ArrowRight size={16} />
        </Link>
      </section>

      <section className="org-cta">
        <div>
          <div className="eyebrow">For schools & organizations</div>
          <h2>
            Does your school or organization
            <br />
            need books?
          </h2>
          <p>Create a verified organization profile, publish your needs, and receive donations directly from your community.</p>
        </div>
        <Link href="/signup" className="button button-primary">
          Create an Organization Account <ArrowRight size={17} />
        </Link>
      </section>

      <footer>
        <Link href="/" className="brand">
          <span className="brand-mark">
            <BookOpen size={17} />
          </span>
          <span>
            book<span>bridge</span>
          </span>
        </Link>
        <span>Books move. Communities grow.</span>
        <div>
          <Link href="/how-it-works">About</Link>
          <Link href="/impact">Impact</Link>
          <Link href="/">Privacy</Link>
        </div>
      </footer>
    </main>
  )
}
