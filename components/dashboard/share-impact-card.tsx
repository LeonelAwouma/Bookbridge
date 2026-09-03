'use client'

import { Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n/provider'

export function ShareImpactCard({ booksDonated, peopleSupported }: { booksDonated: number; peopleSupported: number }) {
  const { t, dict } = useI18n()
  const bookWord = booksDonated === 1 ? dict.dashboard.shareImpactBook : dict.dashboard.shareImpactBooks
  const personWord = peopleSupported === 1 ? dict.dashboard.shareImpactPerson : dict.dashboard.shareImpactPeople
  const text = `${dict.dashboard.shareImpactIDonated} ${booksDonated} ${bookWord} ${dict.dashboard.shareImpactOnBookBridge} ${peopleSupported} ${personWord} ${dict.dashboard.shareImpactAccessEducation}`

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ text, title: 'BookBridge' })
      } catch {
        // user cancelled
      }
      return
    }
    await navigator.clipboard.writeText(text)
    toast.success(t('dashboard.shareCopied'))
  }

  if (booksDonated === 0) return null

  return (
    <div className="mt-8 rounded-lg bg-plum p-5" style={{ background: 'var(--plum)' }}>
      <p className="text-sm leading-relaxed" style={{ color: '#5c4058' }}>
        {text}
      </p>
      <Button size="sm" variant="outline" className="mt-3 bg-white" onClick={share}>
        <Share2 size={14} /> {t('dashboard.shareButton')}
      </Button>
    </div>
  )
}
