import { SiteHeader } from '@/components/layout/site-header'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { getCurrentUserAndProfile, getUnreadNotificationCount } from '@/lib/supabase/queries'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await getCurrentUserAndProfile()
  const unreadCount = profile ? await getUnreadNotificationCount(profile.id) : 0

  return (
    <>
      <SiteHeader profile={profile} unreadCount={unreadCount} />
      {children}
      <MobileBottomNav profile={profile} />
    </>
  )
}
