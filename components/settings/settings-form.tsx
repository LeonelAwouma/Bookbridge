'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { LocationPicker, type LocationValue } from '@/components/location/location-picker'
import { updateProfileAction } from '@/lib/actions/profile'
import type { Profile } from '@/lib/supabase/types'

export function SettingsForm({ profile }: { profile: Profile }) {
  const [fullName, setFullName] = useState(profile.full_name)
  const [bio, setBio] = useState(profile.bio ?? '')
  const [phone, setPhone] = useState(profile.phone ?? '')
  const [location, setLocation] = useState<LocationValue>({
    country: profile.country ?? '',
    region: profile.region ?? '',
    city: profile.city ?? '',
    neighborhood: profile.neighborhood ?? '',
    latitude: profile.latitude,
    longitude: profile.longitude,
  })
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const result = await updateProfileAction({ fullName, bio, phone, locale: profile.locale, ...location })
    setSubmitting(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Profile updated.')
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Phone (private, only shared after a request is accepted)</Label>
        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>

      <LocationPicker value={location} onChange={setLocation} />

      <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
        {submitting && <Loader2 className="animate-spin" size={16} />}
        Save changes
      </Button>
    </form>
  )
}
