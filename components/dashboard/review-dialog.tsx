'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { submitReviewAction } from '@/lib/actions/requests'
import { useI18n } from '@/lib/i18n/provider'

export function ReviewDialog({ donationRequestId, revieweeId, revieweeName }: { donationRequestId: string; revieweeId: string; revieweeName: string }) {
  const { t } = useI18n()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const result = await submitReviewAction({ donationRequestId, revieweeId, rating, comment })
    setSubmitting(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    setOpen(false)
    toast.success(t('dashboard.reviewThanks'))
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>{t('dashboard.rateExperience')}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('dashboard.rateDialogTitle', { name: revieweeName })}</DialogTitle>
          <DialogDescription>{t('dashboard.rateDialogSubtitle')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button type="button" key={n} onClick={() => setRating(n)} aria-label={`${n} stars`}>
                <Star size={24} className={n <= rating ? 'fill-primary text-primary' : 'text-muted-foreground'} />
              </button>
            ))}
          </div>
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder={t('dashboard.optionalComment')} />
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="animate-spin" size={16} />}
              {t('dashboard.submitReview')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
