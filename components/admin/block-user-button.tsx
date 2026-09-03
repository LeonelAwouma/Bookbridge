'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { setUserBlockedAction } from '@/lib/actions/admin'

export function BlockUserButton({ profileId, blocked }: { profileId: string; blocked: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function onClick() {
    setLoading(true)
    const result = await setUserBlockedAction(profileId, !blocked)
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    router.refresh()
  }

  return (
    <Button size="sm" variant={blocked ? 'outline' : 'destructive'} onClick={onClick} disabled={loading}>
      {loading && <Loader2 className="animate-spin" size={14} />}
      {blocked ? 'Unblock' : 'Block'}
    </Button>
  )
}
