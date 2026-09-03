'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, BookOpen, Gift, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { logoutAction } from '@/lib/actions/auth'
import { useI18n } from '@/lib/i18n/provider'
import type { Profile } from '@/lib/supabase/types'
import { LanguageSwitcher } from './language-switcher'

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function SiteHeader({ profile, unreadCount }: { profile: Profile | null; unreadCount: number }) {
  const { t } = useI18n()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = [
    { href: '/books', label: t('nav.findBooks') },
    { href: '/donate', label: t('nav.donateBooks') },
    { href: '/requests', label: t('nav.bookRequests') },
    { href: '/organizations', label: t('nav.organizations') },
    { href: '/campaigns', label: t('nav.campaigns') },
    { href: '/impact', label: t('nav.impact') },
    { href: '/how-it-works', label: t('nav.howItWorks') },
  ]

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

      <nav className="desktop-nav">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} aria-current={pathname === link.href ? 'page' : undefined}>
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="header-actions">
        <LanguageSwitcher />

        {profile ? (
          <>
            <Link href="/donate" className="hidden md:inline-flex">
              <Button size="sm">
                <Gift size={15} /> {t('nav.donate')}
              </Button>
            </Link>
            <Link href="/notifications" className="icon-button" aria-label={t('nav.notifications')}>
              <Bell size={19} />
              {unreadCount > 0 && <i />}
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none" aria-label={profile.full_name}>
                <span className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-medium text-muted-foreground ring-1 ring-border">
                  {profile.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatar_url} alt={profile.full_name} className="size-full object-cover" />
                  ) : (
                    initials(profile.full_name)
                  )}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{profile.full_name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href="/dashboard">{t('nav.dashboard')}</Link>} />
                <DropdownMenuItem render={<Link href="/dashboard/donations">{t('nav.myDonations')}</Link>} />
                <DropdownMenuItem render={<Link href="/dashboard/requests">{t('nav.myRequests')}</Link>} />
                <DropdownMenuItem render={<Link href="/messages">{t('nav.messages')}</Link>} />
                <DropdownMenuItem render={<Link href="/saved">{t('nav.savedBooks')}</Link>} />
                <DropdownMenuItem render={<Link href={`/profile/${profile.id}`}>{t('nav.profile')}</Link>} />
                <DropdownMenuItem render={<Link href="/settings">{t('nav.settings')}</Link>} />
                {profile.is_admin && <DropdownMenuItem render={<Link href="/admin">{t('nav.admin')}</Link>} />}
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => logoutAction()}>
                  {t('nav.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <div className="hidden items-center gap-2 md:flex">
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
