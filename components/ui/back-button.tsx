'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n/provider'
import { cn } from '@/lib/utils'

export function BackButton({ className, fallbackHref }: { className?: string; fallbackHref?: string }) {
  const { t } = useI18n()
  const router = useRouter()

  function onClick() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push(fallbackHref ?? '/')
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn('inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground', className)}
    >
      <ArrowLeft size={16} />
      {t('common.back')}
    </button>
  )
}
