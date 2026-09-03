'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { createDonationRequestAction } from '@/lib/actions/requests'

export function RequestBookDialog({ bookId, maxQuantity, bookTitle }: { bookId: string; maxQuantity: number; bookTitle: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const result = await createDonationRequestAction({ bookId, quantityRequested: quantity, message })
    setSubmitting(false)
    if (result.error) {
      setError(result.error)
      return
    }
    setOpen(false)
    toast.success('Request sent — the donor will review it soon.')
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="lg" className="w-full sm:w-auto" />}>Request this book</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request &ldquo;{bookTitle}&rdquo;</DialogTitle>
          <DialogDescription>Tell the donor a little about why you need it. They&apos;ll review your profile before accepting.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              max={maxQuantity}
              value={quantity}
              onChange={(e) => setQuantity(Math.min(maxQuantity, Math.max(1, Number(e.target.value) || 1)))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="message">Why do you need this book?</Label>
            <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="A sentence or two helps the donor decide." />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="animate-spin" size={16} />}
              Send request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
