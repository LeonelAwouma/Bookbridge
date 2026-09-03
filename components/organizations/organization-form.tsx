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
import type { OrganizationType } from '@/lib/supabase/types'

const orgTypes: { value: OrganizationType; label: string }[] = [
  { value: 'school', label: 'School' },
  { value: 'university', label: 'University' },
  { value: 'library', label: 'Library' },
  { value: 'ngo', label: 'NGO' },
  { value: 'association', label: 'Association' },
  { value: 'company', label: 'Company' },
]

export function OrganizationForm({ initialLocation, defaultType }: { initialLocation: LocationValue; defaultType: OrganizationType }) {
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
      setError('Please fill in the organization name, country, and city.')
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
        <Label htmlFor="name">Organization name *</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="organizationType">Type</Label>
        <Select value={organizationType} onValueChange={(v) => setOrganizationType((v as OrganizationType) ?? 'school')}>
          <SelectTrigger id="organizationType" className="w-full sm:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {orgTypes.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does your organization do?" />
      </div>

      <LocationPicker value={location} onChange={setLocation} />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contactPerson">Contact person</Label>
          <Input id="contactPerson" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contactEmail">Contact email</Label>
          <Input id="contactEmail" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contactPhone">Contact phone</Label>
          <Input id="contactPhone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
        {submitting && <Loader2 className="animate-spin" size={16} />}
        Create organization
      </Button>
    </form>
  )
}
