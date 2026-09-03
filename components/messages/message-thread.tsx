'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { sendMessageAction } from '@/lib/actions/messages'
import { createClient } from '@/lib/supabase/client'
import { useI18n } from '@/lib/i18n/provider'
import type { Message } from '@/lib/supabase/types'

export function MessageThread({
  conversationId,
  currentUserId,
  otherParticipantName,
  initialMessages,
}: {
  conversationId: string
  currentUserId: string
  otherParticipantName: string
  initialMessages: Pick<Message, 'id' | 'sender_id' | 'body' | 'created_at'>[]
}) {
  const { t } = useI18n()
  const [messages, setMessages] = useState(initialMessages)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const newMessage = payload.new as Message
          setMessages((prev) => (prev.some((m) => m.id === newMessage.id) ? prev : [...prev, newMessage]))
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!draft.trim()) return
    const body = draft.trim()
    setDraft('')
    setSending(true)
    const result = await sendMessageAction({ conversationId, body })
    setSending(false)
    if (result.error) setMessages((prev) => prev)
  }

  return (
    <div className="flex h-[70vh] flex-col rounded-lg border border-border">
      <div className="border-b border-border p-3 text-sm font-medium">{otherParticipantName}</div>
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.map((m) => {
          const mine = m.sender_id === currentUserId
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                  mine ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                }`}
              >
                {m.body}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-border p-3">
        <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={t('messages.writeMessage')} />
        <Button type="submit" size="icon" disabled={sending} aria-label="Send">
          {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
        </Button>
      </form>
    </div>
  )
}
