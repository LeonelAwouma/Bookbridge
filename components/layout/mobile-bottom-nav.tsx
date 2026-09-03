'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, PlusCircle, MessageCircle, User } from 'lucide-react'
import { useI18n } from '@/lib/i18n/provider'
import type { Profile } from '@/lib/supabase/types'

export function MobileBottomNav({ profile }: { profile: Profile | null }) {
  const { t } = useI18n()
  const pathname = usePathname()

  const items = [
    { href: '/', icon: Home, label: t('nav.home') },
    { href: '/books', icon: Search, label: t('nav.search') },
    { href: '/donate', icon: PlusCircle, label: t('nav.donate'), primary: true },
    { href: '/messages', icon: MessageCircle, label: t('nav.messages') },
    { href: profile ? `/profile/${profile.id}` : '/login', icon: User, label: t('nav.profile') },
  ]

  return (
    <nav className="mobile-bottom-nav" aria-label="Primary">
      {items.map((item) => {
        const active = pathname === item.href
        const Icon = item.icon
        return (
          <Link key={item.href} href={item.href} className={`bottom-nav-item ${active ? 'active' : ''} ${item.primary ? 'primary' : ''}`}>
            <span className="bottom-nav-icon">
              <Icon size={item.primary ? 26 : 21} />
            </span>
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
