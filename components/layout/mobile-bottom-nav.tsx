'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ClipboardList, Gift, Home, MessageCircle, PlusCircle, Search, User, X } from 'lucide-react'
import { useI18n } from '@/lib/i18n/provider'
import type { Profile } from '@/lib/supabase/types'

export function MobileBottomNav({ profile }: { profile: Profile | null }) {
  const { t } = useI18n()
  const pathname = usePathname()
  const [quickOpen, setQuickOpen] = useState(false)

  useEffect(() => {
    setQuickOpen(false)
  }, [pathname])

  const leftItems = [
    { href: '/', icon: Home, label: t('nav.home') },
    { href: '/books', icon: Search, label: t('nav.search') },
  ]
  const rightItems = [
    { href: '/messages', icon: MessageCircle, label: t('nav.messages') },
    { href: profile ? '/settings' : '/login', icon: User, label: t('nav.profile') },
  ]

  function renderItem(item: (typeof leftItems)[number]) {
    const active = pathname === item.href
    const Icon = item.icon
    return (
      <Link key={item.href} href={item.href} className={`bottom-nav-item ${active ? 'active' : ''}`}>
        <span className="bottom-nav-icon">
          <Icon size={21} />
        </span>
        <span>{item.label}</span>
      </Link>
    )
  }

  return (
    <>
      {quickOpen && <button type="button" className="bottom-nav-scrim" aria-label="Close" onClick={() => setQuickOpen(false)} />}
      <nav className="mobile-bottom-nav" aria-label="Primary">
        {leftItems.map(renderItem)}

        <div className="bottom-nav-item primary">
          {quickOpen && (
            <div className="bottom-nav-speeddial">
              <Link href="/donate" className="speeddial-option" onClick={() => setQuickOpen(false)}>
                <Gift size={17} /> {t('nav.donateBooks')}
              </Link>
              <Link href="/requests/new" className="speeddial-option" onClick={() => setQuickOpen(false)}>
                <ClipboardList size={17} /> {t('nav.postBookRequest')}
              </Link>
            </div>
          )}
          <button
            type="button"
            className="bottom-nav-icon"
            aria-label={t('nav.quickActions')}
            aria-expanded={quickOpen}
            onClick={() => setQuickOpen((v) => !v)}
          >
            {quickOpen ? <X size={22} /> : <PlusCircle size={26} />}
          </button>
          <span>{t('nav.donate')}</span>
        </div>

        {rightItems.map(renderItem)}
      </nav>
    </>
  )
}
