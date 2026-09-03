import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Bookmark, Gift, LayoutDashboard, LogOut, MessageCircle, ShieldCheck, UserRound } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { SettingsForm } from '@/components/settings/settings-form'
import { logoutAction } from '@/lib/actions/auth'
import { getServerTranslator } from '@/lib/i18n/server'

export const metadata: Metadata = { title: 'Settings — BookBridge' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/settings')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/onboarding')

  const { t } = await getServerTranslator()

  const accountLinks = [
    { href: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { href: '/dashboard/donations', icon: Gift, label: t('nav.myDonations') },
    { href: '/dashboard/requests', icon: Bookmark, label: t('nav.myRequests') },
    { href: '/messages', icon: MessageCircle, label: t('nav.messages') },
    { href: '/saved', icon: Bookmark, label: t('nav.savedBooks') },
    { href: `/profile/${profile.id}`, icon: UserRound, label: t('settings.viewPublicProfile') },
    ...(profile.is_admin ? [{ href: '/admin', icon: ShieldCheck, label: t('nav.admin') }] : []),
  ]

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <h1 className="font-serif text-3xl">{t('settings.title')}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t('settings.subtitle')}</p>

      <section className="mt-6">
        <h2 className="text-sm font-medium text-muted-foreground">{t('settings.myAccount')}</h2>
        <ul className="mt-2 flex flex-col divide-y divide-border rounded-lg border border-border">
          {accountLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="flex items-center gap-3 p-3 text-sm hover:bg-muted">
                <link.icon size={16} className="text-muted-foreground" />
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <form action={logoutAction}>
              <button type="submit" className="flex w-full items-center gap-3 p-3 text-left text-sm text-destructive hover:bg-muted">
                <LogOut size={16} />
                {t('nav.logout')}
              </button>
            </form>
          </li>
        </ul>
      </section>

      <div className="mt-8">
        <SettingsForm profile={profile} />
      </div>
    </div>
  )
}
