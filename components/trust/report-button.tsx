'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Flag, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { createReportAction } from '@/lib/actions/trust'
import { useI18n } from '@/lib/i18n/provider'
import type { ReportTargetType } from '@/lib/supabase/types'

const reasonValues = ['inappropriate', 'scam', 'not_described', 'spam', 'other'] as const

export function ReportButton({ targetType, targetId }: { targetType: ReportTargetType; targetId: string }) {
  const { t } = useI18n()
  const reasonLabels: Record<(typeof reasonValues)[number], string> = {
    inappropriate: t('trust.reasonInappropriate'),
    scam: t('trust.reasonScam'),
    not_described: t('trust.reasonNotDescribed'),
    spam: t('trust.reasonSpam'),
    other: t('trust.reasonOther'),
  }
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<(typeof reasonValues)[number]>('inappropriate')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const result = await createReportAction({ targetType, targetId, reason: reasonLabels[reason], description })
    setSubmitting(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    setOpen(false)
    setDescription('')
    toast.success(t('trust.reportThanks'))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<button className="inline-flex w-fit items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive" />}
      >
        <Flag size={13} /> {t('trust.report')}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('trust.reportThis', { type: targetType })}</DialogTitle>
          <DialogDescription>{t('trust.reportSubtitle')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>{t('trust.reason')}</Label>
            <Select value={reason} onValueChange={(v) => setReason((v as (typeof reasonValues)[number]) ?? 'inappropriate')}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reasonValues.map((r) => (
                  <SelectItem key={r} value={r}>
                    {reasonLabels[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">{t('trust.detailsOptional')}</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="submit" variant="destructive" disabled={submitting}>
              {submitting && <Loader2 className="animate-spin" size={16} />}
              {t('trust.submitReport')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
