'use client'

import { useMemo, useState } from 'react'
import {
  ArrowRight,
  Bell,
  BookOpen,
  Bookmark,
  Check,
  ChevronDown,
  CircleHelp,
  Gift,
  Heart,
  LayoutGrid,
  List,
  Map,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react'

const books = [
  { id: 1, title: 'The River Between', author: 'Ngũgĩ wa Thiong’o', type: 'Novel', city: 'Douala', area: 'Bonapriso', distance: '2.4 km', initials: 'TR', color: 'plum', donor: 'Amélie N.', condition: 'Like new' },
  { id: 2, title: 'Mathematics Form 4', author: 'Longhorn Publishers', type: 'School', city: 'Nairobi', area: 'Kilimani', distance: '3.1 km', initials: 'MF', color: 'gold', donor: 'David K.', condition: 'Good condition' },
  { id: 3, title: 'Things Fall Apart', author: 'Chinua Achebe', type: 'Novel', city: 'Accra', area: 'Osu', distance: '4.6 km', initials: 'TA', color: 'sage', donor: 'Kofi A.', condition: 'Good condition' },
  { id: 4, title: 'Introduction to Biology', author: 'M. N. O. Sadiku', type: 'Textbook', city: 'Dakar', area: 'Mermoz', distance: '5.2 km', initials: 'IB', color: 'blue', donor: 'Fatou D.', condition: 'Like new' },
]

const needs = [
  { title: 'Primary school readers', place: 'Yaoundé, Centre', count: '12 books needed', icon: 'PR' },
  { title: 'French grammar workbooks', place: 'Abidjan, Cocody', count: '8 books needed', icon: 'FG' },
  { title: 'Computer science basics', place: 'Kigali, Kicukiro', count: '5 books needed', icon: 'CS' },
]

const categories = ['School books', 'Novels', 'Children’s books', 'Professional', 'Languages']

export default function Page() {
  const [location, setLocation] = useState('Douala')
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'list' | 'map'>('list')
  const [saved, setSaved] = useState<number[]>([])
  const [modal, setModal] = useState<'donate' | 'request' | null>(null)
  const [notice, setNotice] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const filteredBooks = useMemo(() => books.filter((book) => [book.title, book.author, book.type, book.city].join(' ').toLowerCase().includes(search.toLowerCase())), [search])
  const flash = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(''), 2600) }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {notice && <div role="status" className="toast"><Check size={16} /> {notice}</div>}
      <header className="site-header">
        <a href="#top" className="brand"><span className="brand-mark"><BookOpen size={20} /></span><span>book<span>bridge</span></span></a>
        <nav className="desktop-nav"><a href="#explore">Explore books</a><a href="#how-it-works">How it works</a><a href="#impact">Our impact</a></nav>
        <div className="header-actions"><button className="icon-button" aria-label="Notifications" onClick={() => flash('You’re all caught up')}><Bell size={19} /><i /></button><button className="avatar" aria-label="Open profile" onClick={() => flash('Profile coming soon')}>AN</button><button className="menu-button" aria-label="Open menu" onClick={() => setMenuOpen(!menuOpen)}><Menu size={22} /></button></div>
        {menuOpen && <div className="mobile-menu"><a href="#explore" onClick={() => setMenuOpen(false)}>Explore books</a><a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a><a href="#impact" onClick={() => setMenuOpen(false)}>Our impact</a></div>}
      </header>

      <section id="top" className="hero-shell"><div className="hero-copy"><div className="eyebrow"><Sparkles size={15} /> Books find new homes here</div><h1>Pass a book on.<br /><em>Pass possibility on.</em></h1><p>BookBridge connects people who have books to share with people who are looking for them — starting right in your neighborhood.</p><div className="hero-actions"><button className="button button-primary" onClick={() => setModal('donate')}><Gift size={17} /> Donate a book</button><a className="button button-secondary" href="#explore">Find a book <ArrowRight size={17} /></a></div><div className="social-proof"><div className="avatar-stack"><span>FA</span><span>JK</span><span>MO</span><span>+</span></div><span><strong>2,400+</strong> books already shared</span></div></div><div className="hero-art" aria-label="Illustration of books being passed between people"><div className="sun-disc" /><div className="book-stack"><span className="book-one">READ<br />MORE</span><span className="book-two">SAVOIR<br />PARTAGER</span><span className="book-three">THE<br />JOURNEY</span></div><div className="person person-left" /><div className="person person-right" /><div className="leaf leaf-one" /><div className="leaf leaf-two" /><span className="art-label">A small act<br /><strong>travels far.</strong></span></div></section>

      <section id="impact" className="impact-bar"><div><strong>2,400+</strong><span>books rehomed</span></div><div><strong>18</strong><span>cities connected</span></div><div><strong>640</strong><span>people taking part</span></div><div className="impact-note"><Heart size={18} fill="currentColor" /> Every book makes a difference.</div></section>

      <section id="explore" className="content-section"><div className="section-heading"><div><div className="eyebrow">Discover & share</div><h2>Books near you</h2><p>Find your next read, or help one find its reader.</p></div><div className="location-select"><MapPin size={16} /><select aria-label="Choose city" value={location} onChange={(e) => setLocation(e.target.value)}><option>Douala</option><option>Yaoundé</option><option>Dakar</option><option>Abidjan</option><option>Lagos</option><option>Accra</option><option>Nairobi</option><option>Kigali</option></select><ChevronDown size={15} /></div></div><div className="category-row">{categories.map((category, index) => <button key={category} className={index === 0 ? 'category active' : 'category'} onClick={() => setSearch(index === 0 ? 'School' : category.split(' ')[0])}>{category}</button>)}</div><div className="explore-toolbar"><label className="search-box"><Search size={18} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title, author, or subject" /></label><div className="view-toggle"><button className={view === 'list' ? 'selected' : ''} onClick={() => setView('list')} aria-label="List view"><List size={17} /> List</button><button className={view === 'map' ? 'selected' : ''} onClick={() => setView('map')} aria-label="Map view"><Map size={17} /> Map</button></div></div>{view === 'map' ? <div className="map-view"><MapPin size={28} /><strong>Books shared across {location}</strong><span>Switch to list view to browse available books.</span></div> : <div className="book-grid">{filteredBooks.map((book) => <article className="book-card" key={book.id}><div className={`book-cover ${book.color}`}><span>{book.initials}</span><small>BOOKBRIDGE</small></div><div className="book-info"><div className="book-topline"><span className="tag">{book.type}</span><button className={`save-button ${saved.includes(book.id) ? 'saved' : ''}`} aria-label={`Save ${book.title}`} onClick={() => setSaved(saved.includes(book.id) ? saved.filter((id) => id !== book.id) : [...saved, book.id])}><Bookmark size={18} fill={saved.includes(book.id) ? 'currentColor' : 'none'} /></button></div><h3>{book.title}</h3><p className="muted">{book.author}</p><div className="card-meta"><span><MapPin size={14} /> {book.area}, {book.city}</span><span>{book.distance}</span></div><div className="card-footer"><span><span className="mini-avatar">{book.donor.slice(0, 2)}</span>{book.condition}</span><button className="text-button" onClick={() => setModal('request')}>Request <ArrowRight size={15} /></button></div></div></article>)}</div>}<div className="center-action"><button className="button button-secondary" onClick={() => flash('Showing all available books')}>View all books <ArrowRight size={16} /></button></div></section>

      <section className="needs-section"><div className="section-heading"><div><div className="eyebrow">Make an impact</div><h2>Books needed near you</h2><p>Somebody is waiting for the right book.</p></div><button className="text-button" onClick={() => setModal('request')}>See all requests <ArrowRight size={15} /></button></div><div className="needs-grid">{needs.map((need) => <article className="need-card" key={need.title}><div className="need-icon">{need.icon}</div><h3>{need.title}</h3><p><MapPin size={14} /> {need.place}</p><div className="need-bottom"><span>{need.count}</span><button onClick={() => setModal('donate')}>I can help <ArrowRight size={15} /></button></div></article>)}</div></section>

      <section id="how-it-works" className="how-section"><div className="how-intro"><div className="eyebrow">Simple by design</div><h2>One book.<br /><em>A world of difference.</em></h2><p>Whether you’re sharing a book or looking for one, BookBridge keeps it simple, local, and human.</p></div><div className="steps"><div><span>01</span><Gift size={24} /><h3>Share what you have</h3><p>List a book in under a minute. We’ll keep your exact address private.</p></div><div><span>02</span><Search size={24} /><h3>Find what you need</h3><p>Browse books and requests from your city and nearby neighborhoods.</p></div><div><span>03</span><Users size={24} /><h3>Connect safely</h3><p>Arrange a handoff that works for both of you. A book starts a conversation.</p></div></div></section>

      <section className="trust-section"><ShieldCheck size={28} /><div><h2>Built on trust, one neighbor at a time.</h2><p>Your privacy matters. We show neighborhoods, never exact addresses, and you’re always in control of what you share.</p></div><button className="button button-secondary" onClick={() => flash('Safety guide coming soon')}>Our safety guide <ArrowRight size={16} /></button></section>
      <section className="org-cta"><div><div className="eyebrow">For schools & organizations</div><h2>Bring more books<br />to more readers.</h2><p>Partner with BookBridge to organize drives, support a school, or help us reach a new community.</p></div><button className="button button-primary" onClick={() => flash('Thanks — we’ll be in touch')}>Become a partner <ArrowRight size={17} /></button></section>
      <footer><a href="#top" className="brand"><span className="brand-mark"><BookOpen size={17} /></span><span>book<span>bridge</span></span></a><span>Books move. Communities grow.</span><div><a href="#how-it-works">About</a><a href="#impact">Impact</a><a href="#top">Privacy</a></div></footer>

      {modal && <div className="modal-backdrop" onClick={() => setModal(null)}><div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setModal(null)} aria-label="Close"><X size={20} /></button><div className="eyebrow">BookBridge</div><h2>{modal === 'donate' ? 'Share a book' : 'Request a book'}</h2><p>{modal === 'donate' ? 'Tell us about a book that deserves a new reader.' : 'Send a note to the person sharing this book.'}</p><label>Book title<input placeholder="e.g. Half of a Yellow Sun" autoFocus /></label><label>{modal === 'donate' ? 'Condition' : 'Your message'}<textarea placeholder={modal === 'donate' ? 'A few words about its condition' : 'Why would this book be meaningful to you?'} /></label><button className="button button-primary full" onClick={() => { setModal(null); flash(modal === 'donate' ? 'Your book is ready to be shared' : 'Request sent successfully') }}>{modal === 'donate' ? 'Continue' : 'Send request'} <ArrowRight size={16} /></button></div></div>}
    </main>
  )
}
