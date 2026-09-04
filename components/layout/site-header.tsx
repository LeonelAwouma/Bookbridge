'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, BookOpen, Gift, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n/provider'
import { initials } from '@/lib/utils'
import type { Profile } from '@/lib/supabase/types'
import { LanguageSwitcher } from './language-switcher'

// Home page sections that mirror a nav link — scrolling past one highlights
// the matching link even though it navigates to its own page, not an anchor.
const HOME_SECTION_HREF: Record<string, string> = {
  explore: '/books',
  needs: '/requests',
  'how-it-works': '/how-it-works',
}

export function SiteHeader({ profile, unreadCount }: { profile: Profile | null; unreadCount: number }) {
  const { t } = useI18n()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [sectionHref, setSectionHref] = useState<string | null>(null)
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null)
  const navRef = useRef<HTMLElement>(null)
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>())

  const navLinks = [
    { href: '/books', label: t('nav.findBooks') },
    { href: '/donate', label: t('nav.donateBooks') },
    { href: '/requests', label: t('nav.bookRequests') },
    { href: '/organizations', label: t('nav.organizations') },
    { href: '/campaigns', label: t('nav.campaigns') },
    { href: '/impact', label: t('nav.impact') },
    { href: '/how-it-works', label: t('nav.howItWorks') },
  ]

  const activeHref = pathname === '/' ? sectionHref : pathname

  // On the home page, track which section is scrolled into view and treat
  // its matching nav link as active, instead of relying on the route alone.
  useEffect(() => {
    setSectionHref(null)
    if (pathname !== '/') return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setSectionHref(HOME_SECTION_HREF[entry.target.id] ?? null)
        }
      },
      { rootMargin: '-96px 0px -70% 0px', threshold: 0 },
    )
    for (const id of Object.keys(HOME_SECTION_HREF)) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [pathname])

  // Slide the underline to whichever link is active, measuring positions
  // live so it keeps up with language switches (label lengths change).
  useEffect(() => {
    function measure() {
      const nav = navRef.current
      const el = activeHref ? linkRefs.current.get(activeHref) : null
      if (!nav || !el) {
        setIndicator(null)
        return
      }
      const navRect = nav.getBoundingClientRect()
      const elRect = el.getBoundingClientRect()
      setIndicator({ left: elRect.left - navRect.left, width: elRect.width })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [activeHref, t])

  return (
    <header className="site-header">
      <Link href="/" className="brand">
        <span className="brand-mark">
          <BookOpen size={20} />
        </span>
        <span>
          book<span>bridge</span>
        </span>
      </Link>

      <nav className="desktop-nav" ref={navRef}>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            ref={(el) => {
              if (el) linkRefs.current.set(link.href, el)
              else linkRefs.current.delete(link.href)
            }}
            aria-current={activeHref === link.href ? 'page' : undefined}
          >
            {link.label}
          </Link>
        ))}
        {indicator && <span className="nav-indicator" style={{ transform: `translateX(${indicator.left}px)`, width: indicator.width }} />}
      </nav>

      <div className="header-actions">
        <LanguageSwitcher />

        {profile ? (
          <>
            <Link href="/donate" className="hidden min-[1200px]:inline-flex">
              <Button size="sm">
                <Gift size={15} /> {t('nav.donate')}
              </Button>
            </Link>
            <Link href="/notifications" className="icon-button" aria-label={t('nav.notifications')}>
              <Bell size={19} />
              {unreadCount > 0 && <i />}
            </Link>
            <Link href="/settings" aria-label={t('nav.settings')}>
              <span className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-medium text-muted-foreground ring-1 ring-border">
                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt={profile.full_name} className="size-full object-cover" />
                ) : (
                  initials(profile.full_name)
                )}
              </span>
            </Link>
          </>
        ) : (
          <div className="hidden items-center gap-2 min-[1200px]:flex">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                {t('nav.login')}
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">{t('nav.signup')}</Button>
            </Link>
          </div>
        )}

        <button className="menu-button" aria-label="Open menu" onClick={() => setMenuOpen((v) => !v)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          {!profile && (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)}>
                {t('nav.login')}
              </Link>
              <Link href="/signup" onClick={() => setMenuOpen(false)}>
                {t('nav.signup')}
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
