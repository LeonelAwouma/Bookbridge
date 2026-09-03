'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LocationPicker, type LocationValue } from '@/components/location/location-picker'
import { createNeedAction } from '@/lib/actions/needs'
import { categoryOptions, educationLevelOptions, languageOptions } from '@/lib/data/taxonomy'
import { useI18n } from '@/lib/i18n/provider'
import type { BookCategory, EducationLevel, NeedPriority } from '@/lib/supabase/types'

export function NeedForm({ initialLocation, organizations }: { initialLocation: LocationValue; organizations: { id: string; name: string }[] }) {
  const { t, dict } = useI18n()
  const router = useRouter()
  const [organizationId, setOrganizationId] = useState<string>(organizations[0]?.id ?? 'individual')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<BookCategory>('other')
  const [subject, setSubject] = useState('')
  const [educationLevel, setEducationLevel] = useState<EducationLevel>('all_levels')
  const [language, setLanguage] = useState('fr')
  const [quantity, setQuantity] = useState(10)
  const [priority, setPriority] = useState<NeedPriority>('medium')
  const [deadline, setDeadline] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState<LocationValue>(initialLocation)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setError(t('needs.titleError'))
      return
    }
    if (!location.country || !location.city) {
      setError(t('donate.locationError'))
      return
    }
    setSubmitting(true)
    setError(null)
    const result = await createNeedAction({
      organizationId: organizationId === 'individual' ? null : organizationId,
      title: title.trim(),
      category,
      subject,
      educationLevel,
      language,
      quantityNeeded: quantity,
      description,
      priority,
      deadline,
      ...location,
    })
    setSubmitting(false)
    if (result.error || !result.needId) {
      setError(result.error ?? 'Something went wrong.')
      return
    }
    router.push(`/requests/${result.needId}`)
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      {organizations.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="organizationId">{t('needs.postingAs')}</Label>
          <Select value={organizationId} onValueChange={(v) => setOrganizationId(v ?? 'individual')}>
            <SelectTrigger id="organizationId" className="w-full sm:w-80">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">{t('donate.myself')}</SelectItem>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">{t('needs.whatDoYouNeed')} *</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('needs.whatDoYouNeedPlaceholder')} autoFocus />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="category">{t('common.category')}</Label>
          <Select value={category} onValueChange={(v) => setCategory((v as BookCategory) ?? 'other')}>
            <SelectTrigger id="category" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions(dict).map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="subject">
            {t('common.subject')} ({t('common.optional')})
          </Label>
          <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="educationLevel">{t('common.educationLevel')}</Label>
          <Select value={educationLevel} onValueChange={(v) => setEducationLevel((v as EducationLevel) ?? 'all_levels')}>
            <SelectTrigger id="educationLevel" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {educationLevelOptions(dict).map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="language">{t('common.language')}</Label>
          <Select value={language} onValueChange={(v) => setLanguage(v ?? 'fr')}>
            <SelectTrigger id="language" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languageOptions(dict).map((opt) => (
                <SelectItem key={opt.code} value={opt.code}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="quantity">{t('needs.quantityNeeded')}</Label>
          <Input id="quantity" type="number" min={1} value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="priority">{t('needs.priority')}</Label>
          <Select value={priority} onValueChange={(v) => setPriority((v as NeedPriority) ?? 'medium')}>
            <SelectTrigger id="priority" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">{dict.priority.low}</SelectItem>
              <SelectItem value="medium">{dict.priority.medium}</SelectItem>
              <SelectItem value="high">{dict.priority.high}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="deadline">{t('needs.deadlineOptional')}</Label>
          <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">{t('needs.tellDonorsMore')}</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('needs.tellDonorsMorePlaceholder')} />
      </div>

      <LocationPicker value={location} onChange={setLocation} />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
        {submitting && <Loader2 className="animate-spin" size={16} />}
        {t('needs.publishRequest')}
      </Button>
    </form>
  )
}
