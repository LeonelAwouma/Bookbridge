'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n/provider'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useI18n()

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <AlertTriangle size={32} className="text-primary" />
      <h1 className="font-serif text-2xl">{t('common.somethingWrong')}</h1>
      <p className="text-sm text-muted-foreground">{t('common.somethingWrongBody')}</p>
      <div className="flex gap-2">
        <Button onClick={reset}>{t('common.tryAgain')}</Button>
        <Link href="/">
          <Button variant="outline">{t('common.goHome')}</Button>
        </Link>
      </div>
    </div>
  )
}
