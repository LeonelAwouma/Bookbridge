import Link from 'next/link'
import { ArrowRight, BookOpen, Gift, Heart, MapPin, Search, ShieldCheck, Users } from 'lucide-react'
import { BookCard } from '@/components/books/book-card'
import { getBooks } from '@/lib/supabase/books-queries'
import { getCurrentUserAndProfile } from '@/lib/supabase/queries'
import { createClient } from '@/lib/supabase/server'
import { getServerTranslator } from '@/lib/i18n/server'
import { initials } from '@/lib/utils'

async function getPlatformStats() {
  const supabase = await createClient()
  const [{ count: books }, { count: donors }, { count: schools }] = await Promise.all([
    supabase.from('books').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).gt('donations_completed_count', 0),
    supabase.from('organizations').select('id', { count: 'exact', head: true }),
  ])
  return { books: books ?? 0, donors: donors ?? 0, schools: schools ?? 0 }
}

async function getRecentDonors() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name')
    .gt('donations_completed_count', 0)
    .order('updated_at', { ascending: false })
    .limit(3)
  return data ?? []
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
  const city = profile?.city || undefined
  const { dict, t } = await getServerTranslator()

  const [books, stats, needs, recentDonors] = await Promise.all([
    getBooks({ city, limit: 8 }),
    getPlatformStats(),
    getNeedsNearby(city),
    getRecentDonors(),
  ])

  return (
    <main className="min-h-screen bg-background text-foreground" id="top">
      <section className="hero-shell">
        <div className="hero-copy">
          <div className="eyebrow">{t('home.heroEyebrow')}</div>
          <h1>
            {dict.home.heroHeadlineLine1}
            <br />
            {dict.home.heroHeadlineLine2Prefix}
            <em>{dict.home.heroHeadlineLine2Em}</em>
          </h1>
          <p>{t('home.heroSubheadline')}</p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/donate">
              <Gift size={17} /> {t('home.ctaDonate')}
            </Link>
            <Link className="button button-secondary" href="/books">
              {t('home.ctaFind')} <ArrowRight size={17} />
            </Link>
          </div>
          {recentDonors.length > 0 && (
            <div className="social-proof">
              <div className="avatar-stack">
                {recentDonors.map((donor) => (
                  <span key={donor.id}>{initials(donor.full_name)}</span>
                ))}
                {stats.donors > recentDonors.length && <span>+</span>}
              </div>
              <span>{t('home.booksAlreadyDonated', { count: stats.books })}</span>
            </div>
          )}
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
            {dict.home.artLabelLine1}
            <br />
            <strong>{dict.home.artLabelStrong}</strong>
          </span>
        </div>
      </section>

      <section className="impact-bar">
        <div>
          <strong>{stats.books}+</strong>
          <span>{t('home.impactBooksDonated')}</span>
        </div>
        <div>
          <strong>{stats.donors}+</strong>
          <span>{t('home.impactActiveDonors')}</span>
        </div>
        <div>
          <strong>{stats.schools}+</strong>
          <span>{t('home.impactOrganizationsSupported')}</span>
        </div>
        <div className="impact-note">
          <Heart size={18} fill="currentColor" /> {t('home.impactNote')}
        </div>
      </section>

      <section id="explore" className="content-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">{t('home.exploreEyebrow')}</div>
            <h2>{city ? t('home.booksNear', { city }) : t('home.booksNearYou')}</h2>
            <p>{t('home.booksNearSubtitle')}</p>
            {profile && !city && (
              <p className="text-xs text-muted-foreground">
                {t('home.addLocationPrompt')}{' '}
                <Link href="/settings" className="text-primary hover:underline">
                  {t('nav.settings')}
                </Link>
              </p>
            )}
          </div>
          <Link href="/books" className="text-button">
            {t('home.seeAllBooks')} <ArrowRight size={15} />
          </Link>
        </div>
        {books.length === 0 ? (
          <div className="map-view">
            <MapPin size={28} />
            <strong>{city ? t('home.noBooksYet', { city }) : t('home.noBooksYetGeneric')}</strong>
            <span>{t('home.noBooksYetHint')}</span>
          </div>
        ) : (
          <div className="book-grid">
            {books.map((book) => (
              <BookCard key={book.id} book={book} canSave={!!profile} />
            ))}
          </div>
        )}
      </section>

      <section id="needs" className="needs-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">{t('home.impactEyebrow')}</div>
            <h2>{t('home.needsNear')}</h2>
            <p>{t('home.needsNearSubtitle')}</p>
          </div>
          <Link href="/requests" className="text-button">
            {t('home.seeAllRequests')} <ArrowRight size={15} />
          </Link>
        </div>
        {needs.length === 0 ? (
          <p className="muted">{city ? t('home.noOpenRequests', { city }) : t('home.noOpenRequestsGeneric')}</p>
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
                  <span>{t('home.booksNeededCount', { count: need.quantity_needed - need.quantity_fulfilled })}</span>
                  <span>
                    {t('home.iCanHelp')} <ArrowRight size={15} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section id="how-it-works" className="how-section">
        <div className="how-intro">
          <div className="eyebrow">{t('home.howEyebrow')}</div>
          <h2>
            {dict.home.howTitleLine1}
            <br />
            <em>{dict.home.howTitleEm}</em>
          </h2>
          <p>{t('home.howSubtitle')}</p>
        </div>
        <div className="steps">
          <div>
            <span>01</span>
            <Gift size={24} />
            <h3>{t('home.step1Title')}</h3>
            <p>{t('home.step1Body')}</p>
          </div>
          <div>
            <span>02</span>
            <Search size={24} />
            <h3>{t('home.step2Title')}</h3>
            <p>{t('home.step2Body')}</p>
          </div>
          <div>
            <span>03</span>
            <Users size={24} />
            <h3>{t('home.step3Title')}</h3>
            <p>{t('home.step3Body')}</p>
          </div>
        </div>
      </section>

      <section className="trust-section">
        <ShieldCheck size={28} />
        <div>
          <h2>{t('home.trustTitle')}</h2>
          <p>{t('home.trustBody')}</p>
        </div>
        <Link href="/impact" className="button button-secondary">
          {t('home.ourImpact')} <ArrowRight size={16} />
        </Link>
      </section>

      <section className="org-cta">
        <div>
          <div className="eyebrow">{t('home.orgCtaEyebrow')}</div>
          <h2>
            {dict.home.orgCtaTitleLine1}
            <br />
            {dict.home.orgCtaTitleLine2}
          </h2>
          <p>{t('home.orgCtaBody')}</p>
        </div>
        <Link href="/signup" className="button button-primary">
          {t('home.orgCtaButton')} <ArrowRight size={17} />
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
        <span>{t('home.footerTagline')}</span>
        <div>
          <Link href="/how-it-works">{t('home.footerAbout')}</Link>
          <Link href="/impact">{t('home.footerImpact')}</Link>
          <Link href="/privacy">{t('home.footerPrivacy')}</Link>
          <span>🇨🇲 Leonel AWOUMA</span>
        </div>
      </footer>
    </main>
  )
}
