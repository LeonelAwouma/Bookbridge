'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createCampaignAction } from '@/lib/actions/campaigns'
import { categoryOptions } from '@/lib/data/taxonomy'
import { useI18n } from '@/lib/i18n/provider'
import type { BookCategory } from '@/lib/supabase/types'

export function CampaignForm({ organization }: { organization: { id: string; country: string; city: string } }) {
  const { t, dict } = useI18n()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [goalQuantity, setGoalQuantity] = useState(100)
  const [category, setCategory] = useState<BookCategory | 'all'>('all')
  const [deadline, setDeadline] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setError(t('campaigns.titleError'))
      return
    }
    setSubmitting(true)
    setError(null)
    const result = await createCampaignAction({
      organizationId: organization.id,
      title: title.trim(),
      description,
      goalQuantity,
      country: organization.country,
      region: '',
      city: organization.city,
      category: category === 'all' ? null : category,
      educationLevel: null,
      deadline,
    })
    setSubmitting(false)
    if (result.error || !result.campaignId) {
      setError(result.error ?? 'Something went wrong.')
      return
    }
    router.push(`/campaigns/${result.campaignId}`)
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">{t('campaigns.campaignTitle')} *</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('campaigns.campaignTitlePlaceholder')} autoFocus />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">{t('common.description')}</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('campaigns.descriptionPlaceholder')} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="goalQuantity">{t('campaigns.goalBooks')}</Label>
          <Input id="goalQuantity" type="number" min={1} value={goalQuantity} onChange={(e) => setGoalQuantity(Math.max(1, Number(e.target.value) || 1))} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="deadline">{t('campaigns.deadlineOptional')}</Label>
          <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="category">{t('campaigns.focusCategory')}</Label>
        <Select value={category} onValueChange={(v) => setCategory((v as BookCategory | 'all') ?? 'all')}>
          <SelectTrigger id="category" className="w-full sm:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('campaigns.anyCategory')}</SelectItem>
            {categoryOptions(dict).map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
        {submitting && <Loader2 className="animate-spin" size={16} />}
        {t('campaigns.launchCampaign')}
      </Button>
    </form>
  )
}
