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
import type { ReportTargetType } from '@/lib/supabase/types'

const reasons = ['Inappropriate content', 'Suspicious or scam behavior', 'Item not as described', 'Spam', 'Other']

export function ReportButton({ targetType, targetId }: { targetType: ReportTargetType; targetId: string }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState(reasons[0])
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const result = await createReportAction({ targetType, targetId, reason, description })
    setSubmitting(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    setOpen(false)
    setDescription('')
    toast.success('Thanks — our team will review this.')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<button className="inline-flex w-fit items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive" />}
      >
        <Flag size={13} /> Report
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report this {targetType}</DialogTitle>
          <DialogDescription>Our moderation team reviews every report.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Reason</Label>
            <Select value={reason} onValueChange={(v) => setReason(v ?? reasons[0])}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Details (optional)</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="submit" variant="destructive" disabled={submitting}>
              {submitting && <Loader2 className="animate-spin" size={16} />}
              Submit report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
