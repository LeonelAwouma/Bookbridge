'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { startBookConversationAction } from '@/lib/actions/messages'
import { useI18n } from '@/lib/i18n/provider'

export function MessageOwnerButton({ bookId }: { bookId: string }) {
  const { t } = useI18n()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onClick() {
    setSubmitting(true)
    setError(null)
    const result = await startBookConversationAction(bookId)
    setSubmitting(false)
    if (result.error || !result.conversationId) {
      setError(result.error ?? 'Something went wrong. Please try again.')
      return
    }
    router.push(`/messages/${result.conversationId}`)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Button variant="outline" size="lg" className="w-full sm:w-auto" onClick={onClick} disabled={submitting}>
        {submitting ? <Loader2 className="animate-spin" size={16} /> : <MessageCircle size={16} />}
        {t('books.messageOwner')}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
