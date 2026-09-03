'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Gift, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { donateToCampaignAction } from '@/lib/actions/campaigns'

export function DonateToCampaignDialog({ campaignId }: { campaignId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [quantity, setQuantity] = useState(5)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const result = await donateToCampaignAction({ campaignId, quantity })
    setSubmitting(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    setOpen(false)
    toast.success('Thank you! Your pledge was added to the campaign.')
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="lg" />}>
        <Gift size={16} /> Donate to this campaign
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Donate to this campaign</DialogTitle>
          <DialogDescription>Pledge how many books you'll contribute. The organizer will coordinate collection.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="quantity">Number of books</Label>
            <Input id="quantity" type="number" min={1} value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="animate-spin" size={16} />}
              Confirm pledge
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
