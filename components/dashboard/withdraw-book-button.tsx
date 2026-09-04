'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { withdrawBookAction } from '@/lib/actions/books'
import { useI18n } from '@/lib/i18n/provider'

export function WithdrawBookButton({ bookId }: { bookId: string }) {
  const { t } = useI18n()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function onClick() {
    if (!window.confirm(t('donate.withdrawConfirm'))) return
    setLoading(true)
    const result = await withdrawBookAction(bookId)
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success(t('donate.withdrawn'))
    router.refresh()
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={onClick} disabled={loading}>
      {loading ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
      {t('donate.withdrawListing')}
    </Button>
  )
}
