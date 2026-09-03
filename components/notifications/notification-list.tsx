'use client'

import { useRouter } from 'next/navigation'
import { Bell, CheckCheck, Gift, Heart, MessageCircle, PackageCheck, ShieldCheck, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { markAllNotificationsReadAction, markNotificationReadAction } from '@/lib/actions/notifications'
import { useI18n } from '@/lib/i18n/provider'
import type { Notification, NotificationType } from '@/lib/supabase/types'

const icons: Record<NotificationType, React.ComponentType<{ size?: number }>> = {
  request_received: Gift,
  request_accepted: CheckCheck,
  request_rejected: Bell,
  new_message: MessageCircle,
  donation_completed: PackageCheck,
  new_match: Sparkles,
  new_need_nearby: Heart,
  achievement_unlocked: Sparkles,
  org_verified: ShieldCheck,
  report_update: Bell,
}

export function NotificationList({ notifications }: { notifications: Notification[] }) {
  const { t } = useI18n()
  const router = useRouter()

  async function onClick(n: Notification) {
    if (!n.is_read) await markNotificationReadAction(n.id)
    if (n.link) router.push(n.link)
    router.refresh()
  }

  const hasUnread = notifications.some((n) => !n.is_read)

  return (
    <div className="flex flex-col gap-3">
      {hasUnread && (
        <Button
          variant="ghost"
          size="sm"
          className="self-end"
          onClick={async () => {
            await markAllNotificationsReadAction()
            router.refresh()
          }}
        >
          {t('notifications.markAllRead')}
        </Button>
      )}
      <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
        {notifications.map((n) => {
          const Icon = icons[n.type] ?? Bell
          return (
            <li key={n.id}>
              <button onClick={() => onClick(n)} className={`flex w-full items-start gap-3 p-4 text-left hover:bg-muted ${!n.is_read ? 'bg-primary/5' : ''}`}>
                <Icon size={18} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{n.title}</p>
                  {n.body && <p className="text-xs text-muted-foreground">{n.body}</p>}
                  <p className="mt-1 text-[10px] text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
                </div>
                {!n.is_read && <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
