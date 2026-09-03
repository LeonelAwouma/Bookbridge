'use client'

import { Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export function ShareImpactCard({ booksDonated, peopleSupported }: { booksDonated: number; peopleSupported: number }) {
  const text = `I donated ${booksDonated} book${booksDonated === 1 ? '' : 's'} on BookBridge and helped ${peopleSupported} ${
    peopleSupported === 1 ? 'person' : 'people'
  } access education. Give your books a second life too!`

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ text, title: 'My BookBridge impact' })
      } catch {
        // user cancelled
      }
      return
    }
    await navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard — share it anywhere!')
  }

  if (booksDonated === 0) return null

  return (
    <div className="mt-8 rounded-lg bg-plum p-5" style={{ background: 'var(--plum)' }}>
      <p className="text-sm leading-relaxed" style={{ color: '#5c4058' }}>
        {text}
      </p>
      <Button size="sm" variant="outline" className="mt-3 bg-white" onClick={share}>
        <Share2 size={14} /> Share your impact
      </Button>
    </div>
  )
}
