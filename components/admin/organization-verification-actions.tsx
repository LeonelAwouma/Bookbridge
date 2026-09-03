'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { setOrganizationVerificationAction } from '@/lib/actions/admin'

export function OrganizationVerificationActions({ organizationId }: { organizationId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<'verified' | 'rejected' | null>(null)

  async function run(status: 'verified' | 'rejected') {
    setLoading(status)
    const result = await setOrganizationVerificationAction(organizationId, status)
    setLoading(null)
    if (result.error) {
      toast.error(result.error)
      return
    }
    router.refresh()
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => run('verified')} disabled={!!loading}>
        {loading === 'verified' && <Loader2 className="animate-spin" size={14} />}
        Approve
      </Button>
      <Button size="sm" variant="outline" onClick={() => run('rejected')} disabled={!!loading}>
        {loading === 'rejected' && <Loader2 className="animate-spin" size={14} />}
        Reject
      </Button>
    </div>
  )
}
