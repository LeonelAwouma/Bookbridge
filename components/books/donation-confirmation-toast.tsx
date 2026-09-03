'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { toast } from 'sonner'
import { useI18n } from '@/lib/i18n/provider'

export function DonationConfirmationToast() {
  const { t } = useI18n()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (searchParams.get('donated') === '1') {
      toast.success(t('books.donatedToast'))
      router.replace(pathname)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router, pathname])

  return null
}
