import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getConversations } from '@/lib/supabase/messages-queries'
import { getServerTranslator } from '@/lib/i18n/server'

export const metadata: Metadata = { title: 'Messages — BookBridge' }

export default async function MessagesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/messages')

  const { t } = await getServerTranslator()
  const conversations = await getConversations(user.id)

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <h1 className="font-serif text-3xl">{t('messages.title')}</h1>

      {conversations.length === 0 ? (
        <div className="map-view mt-6">
          <MessageCircle size={28} />
          <strong>{t('messages.noConversations')}</strong>
          <span>{t('messages.noConversationsHint')}</span>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col divide-y divide-border rounded-lg border border-border">
          {conversations.map((c) => (
            <li key={c.id}>
              <Link href={`/messages/${c.id}`} className="flex items-center gap-3 p-4 hover:bg-muted">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                  {c.otherParticipantName.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{c.otherParticipantName}</p>
                    {c.unread && <span className="size-2 shrink-0 rounded-full bg-primary" />}
                  </div>
                  {c.bookTitle && <p className="truncate text-xs text-muted-foreground">Re: {c.bookTitle}</p>}
                  {c.lastMessage && <p className="truncate text-xs text-muted-foreground">{c.lastMessage}</p>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
