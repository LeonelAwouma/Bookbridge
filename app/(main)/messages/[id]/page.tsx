import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getConversationDetail } from '@/lib/supabase/messages-queries'
import { MessageThread } from '@/components/messages/message-thread'

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/messages/${id}`)

  const detail = await getConversationDetail(id, user.id)
  if (!detail) notFound()

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <MessageThread
        conversationId={id}
        currentUserId={user.id}
        otherParticipantName={detail.otherProfile?.full_name ?? 'BookBridge user'}
        bookTitle={detail.bookTitle}
        bookId={detail.bookId}
        initialMessages={detail.messages}
      />
    </div>
  )
}
