'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { resolveReportAction } from '@/lib/actions/admin'

export function ReportActions({ reportId }: { reportId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<'resolved' | 'dismissed' | null>(null)

  async function run(status: 'resolved' | 'dismissed') {
    setLoading(status)
    const result = await resolveReportAction(reportId, status)
    setLoading(null)
    if (result.error) {
      toast.error(result.error)
      return
    }
    router.refresh()
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => run('resolved')} disabled={!!loading}>
        {loading === 'resolved' && <Loader2 className="animate-spin" size={14} />}
        Resolve
      </Button>
      <Button size="sm" variant="outline" onClick={() => run('dismissed')} disabled={!!loading}>
        {loading === 'dismissed' && <Loader2 className="animate-spin" size={14} />}
        Dismiss
      </Button>
    </div>
  )
}
