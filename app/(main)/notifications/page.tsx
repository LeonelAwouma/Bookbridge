import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { NotificationList } from '@/components/notifications/notification-list'

export const metadata: Metadata = { title: 'Notifications — BookBridge' }

export default async function NotificationsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/notifications')

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <h1 className="font-serif text-3xl">Notifications</h1>
      {!notifications || notifications.length === 0 ? (
        <div className="map-view mt-6">
          <Bell size={28} />
          <strong>You're all caught up</strong>
          <span>New activity will show up here.</span>
        </div>
      ) : (
        <div className="mt-6">
          <NotificationList notifications={notifications} />
        </div>
      )}
    </div>
  )
}
