'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { requestOrganizationVerificationAction } from '@/lib/actions/organizations'

export function VerificationRequestButton({ organizationId }: { organizationId: string }) {
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
    toast.success('Verification requested — our team will review it soon.')
    router.refresh()
  }

  return (
    <Button variant="outline" size="sm" onClick={onClick} disabled={loading}>
      {loading ? <Loader2 className="animate-spin" size={14} /> : <ShieldCheck size={14} />}
      Request verification
    </Button>
  )
}
