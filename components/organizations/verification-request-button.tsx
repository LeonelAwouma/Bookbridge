'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { requestOrganizationVerificationAction } from '@/lib/actions/organizations'
import { useI18n } from '@/lib/i18n/provider'

export function VerificationRequestButton({ organizationId }: { organizationId: string }) {
  const { t } = useI18n()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function onClick() {
    setLoading(true)
    const result = await requestOrganizationVerificationAction(organizationId)
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success(t('organizations.verificationRequested'))
    router.refresh()
  }

  return (
    <Button variant="outline" size="sm" onClick={onClick} disabled={loading}>
      {loading ? <Loader2 className="animate-spin" size={14} /> : <ShieldCheck size={14} />}
      {t('organizations.requestVerification')}
    </Button>
  )
}
