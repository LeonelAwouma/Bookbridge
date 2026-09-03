'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Check, Loader2, MessageCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { acceptDonationRequestAction, completeDonationRequestAction, rejectDonationRequestAction } from '@/lib/actions/requests'

export function RequestActions({ requestId, status, conversationId }: { requestId: string; status: string; conversationId?: string | null }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [action, setAction] = useState<string | null>(null)

  function run(name: string, fn: () => Promise<{ error?: string }>) {
    setAction(name)
    startTransition(async () => {
      const result = await fn()
      if (result.error) toast.error(result.error)
      else router.refresh()
    })
  }

  if (status === 'pending') {
    return (
      <div className="flex gap-2">
        <Button size="sm" onClick={() => run('accept', () => acceptDonationRequestAction(requestId))} disabled={pending}>
          {pending && action === 'accept' ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />} Accept
        </Button>
        <Button size="sm" variant="outline" onClick={() => run('reject', () => rejectDonationRequestAction(requestId))} disabled={pending}>
          {pending && action === 'reject' ? <Loader2 className="animate-spin" size={14} /> : <X size={14} />} Decline
        </Button>
      </div>
    )
  }

  if (status === 'accepted') {
    return (
      <div className="flex gap-2">
        {conversationId && (
          <Link href={`/messages/${conversationId}`}>
            <Button size="sm" variant="outline">
              <MessageCircle size={14} /> Message
            </Button>
          </Link>
        )}
        <Button size="sm" onClick={() => run('complete', () => completeDonationRequestAction(requestId))} disabled={pending}>
          {pending && action === 'complete' ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />} Mark completed
        </Button>
      </div>
    )
  }

  return null
}
