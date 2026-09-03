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
import { createOrganizationAction } from '@/lib/actions/organizations'
import { useI18n } from '@/lib/i18n/provider'
import type { OrganizationType } from '@/lib/supabase/types'

const orgTypeValues: OrganizationType[] = ['school', 'university', 'library', 'ngo', 'association', 'company']

export function OrganizationForm({ initialLocation, defaultType }: { initialLocation: LocationValue; defaultType: OrganizationType }) {
  const { t, dict } = useI18n()
  const router = useRouter()
  const [name, setName] = useState('')
  const [organizationType, setOrganizationType] = useState<OrganizationType>(defaultType)
  const [description, setDescription] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [location, setLocation] = useState<LocationValue>(initialLocation)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !location.country || !location.city) {
      setError(t('organizations.nameError'))
      return
    }
    setSubmitting(true)
    setError(null)
    const result = await createOrganizationAction({
      name: name.trim(),
      organizationType,
      description,
      logoUrl: null,
      contactPerson,
      contactEmail,
      contactPhone,
      ...location,
    })
    setSubmitting(false)
    if (result.error || !result.organizationId) {
      setError(result.error ?? 'Something went wrong.')
      return
    }
    router.push(`/organizations/${result.organizationId}`)
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">{t('organizations.organizationName')} *</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="organizationType">{t('organizations.type')}</Label>
        <Select value={organizationType} onValueChange={(v) => setOrganizationType((v as OrganizationType) ?? 'school')}>
          <SelectTrigger id="organizationType" className="w-full sm:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {orgTypeValues.map((value) => (
              <SelectItem key={value} value={value}>
                {dict.userTypes[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">{t('common.description')}</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <LocationPicker value={location} onChange={setLocation} />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contactPerson">{t('organizations.contactPerson')}</Label>
          <Input id="contactPerson" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contactEmail">{t('organizations.contactEmail')}</Label>
          <Input id="contactEmail" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contactPhone">{t('organizations.contactPhone')}</Label>
          <Input id="contactPhone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
        {submitting && <Loader2 className="animate-spin" size={16} />}
        {t('organizations.createButton')}
      </Button>
    </form>
  )
}
