import type { Metadata } from 'next'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { BlockUserButton } from '@/components/admin/block-user-button'
import { getServerTranslator } from '@/lib/i18n/server'

export const metadata: Metadata = { title: 'Admin — Users — BookBridge' }

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: users } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(100)
  const { dict, t } = await getServerTranslator()

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted text-left text-xs text-muted-foreground">
          <tr>
            <th className="p-3">{t('admin.name')}</th>
            <th className="p-3">{t('admin.type')}</th>
            <th className="p-3">{t('admin.location')}</th>
            <th className="p-3">{t('admin.joined')}</th>
            <th className="p-3">{t('admin.status')}</th>
            <th className="p-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {(users ?? []).map((u) => (
            <tr key={u.id}>
              <td className="p-3">
                <Link href={`/profile/${u.id}`} className="hover:underline">
                  {u.full_name}
                </Link>
              </td>
              <td className="p-3">{dict.userTypes[u.user_type]}</td>
              <td className="p-3">{u.city ? `${u.city}, ${u.country}` : '—'}</td>
              <td className="p-3">{new Date(u.created_at).toLocaleDateString()}</td>
              <td className="p-3">
                <Badge variant={u.is_blocked ? 'destructive' : 'secondary'}>{u.is_blocked ? t('admin.blocked') : t('admin.active')}</Badge>
              </td>
              <td className="p-3">
                <BlockUserButton profileId={u.id} blocked={u.is_blocked} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
