import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CalendarClock, Heart, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getNeedById } from '@/lib/supabase/needs-queries'
import { categoryLabel, educationLevelLabel } from '@/lib/data/taxonomy'
import { getServerTranslator } from '@/lib/i18n/server'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const need = await getNeedById(id)
  return { title: need ? `${need.title} — BookBridge` : 'Request — BookBridge' }
}

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const need = await getNeedById(id)
  if (!need) notFound()

  const { dict, t } = await getServerTranslator()
  const label = need.organizationName ?? need.requesterName ?? 'BookBridge'
  const remaining = need.quantity_needed - need.quantity_fulfilled

  const helpHref = `/donate?category=${need.category}&level=${need.education_level}&subject=${encodeURIComponent(need.subject ?? '')}`

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{categoryLabel(dict, need.category)}</Badge>
        <Badge variant="secondary">{educationLevelLabel(dict, need.education_level)}</Badge>
        {need.priority === 'high' && <Badge variant="destructive">{t('needs.urgent')}</Badge>}
      </div>

      <h1 className="mt-3 font-serif text-3xl">{need.title}</h1>
      <p className="mt-1 text-muted-foreground">{t('needs.requestedBy', { name: label })}</p>

      <div className="mt-6 grid grid-cols-2 gap-4 rounded-lg border border-border p-4 text-sm sm:grid-cols-3">
        <div>
          <p className="text-xs text-muted-foreground">{t('needs.booksNeeded')}</p>
          <p className="font-medium">{remaining}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin size={12} /> {t('common.location')}
          </p>
          <p className="font-medium">
            {need.neighborhood ? `${need.neighborhood}, ` : ''}
            {need.city}
          </p>
        </div>
        {need.deadline && (
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <CalendarClock size={12} /> {t('needs.deadline')}
            </p>
            <p className="font-medium">{new Date(need.deadline).toLocaleDateString()}</p>
          </div>
        )}
      </div>

      {need.description && <p className="mt-6 text-sm leading-relaxed">{need.description}</p>}

      <div className="mt-8">
        <Link href={helpHref}>
          <Button size="lg">
            <Heart size={16} /> {t('needs.iCanHelpDonate')}
          </Button>
        </Link>
      </div>
    </div>
  )
}
