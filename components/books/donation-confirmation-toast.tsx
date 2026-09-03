'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { toast } from 'sonner'

export function DonationConfirmationToast() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (searchParams.get('donated') === '1') {
      toast.success('Your book is live! Nearby beneficiaries can now request it.')
      router.replace(pathname)
    }
  }, [searchParams, router, pathname])

  return null
}
