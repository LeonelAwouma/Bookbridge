import type { Metadata } from 'next'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { ReportActions } from '@/components/admin/report-actions'
import { getServerTranslator } from '@/lib/i18n/server'

export const metadata: Metadata = { title: 'Admin — Reports — BookBridge' }

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  open: 'destructive',
  reviewed: 'secondary',
  resolved: 'outline',
  dismissed: 'outline',
}

export default async function AdminReportsPage() {
  const supabase = await createClient()
  const { data: reports } = await supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(100)
  const { t } = await getServerTranslator()

  const reporterIds = [...new Set((reports ?? []).map((r) => r.reporter_id))]
  const { data: reporters } = reporterIds.length ? await supabase.from('profiles').select('id, full_name').in('id', reporterIds) : { data: [] }
  const reporterById = new Map((reporters ?? []).map((r) => [r.id, r.full_name]))

  if (!reports || reports.length === 0) {
    return <p className="text-sm text-muted-foreground">{t('admin.noReportsYet')}</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {reports.map((r) => (
        <div key={r.id} className="rounded-lg border border-border p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium">
                {r.target_type} — {r.reason}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('admin.by', { name: reporterById.get(r.reporter_id) ?? 'Unknown' })} · {new Date(r.created_at).toLocaleString()}
              </p>
            </div>
            <Badge variant={statusVariant[r.status]}>{r.status}</Badge>
          </div>
          {r.description && <p className="mt-2 text-sm">{r.description}</p>}
          {r.status === 'open' && (
            <div className="mt-3">
              <ReportActions reportId={r.id} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
