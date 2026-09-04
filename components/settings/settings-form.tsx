'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { LocationPicker, type LocationValue } from '@/components/location/location-picker'
import { updateProfileAction } from '@/lib/actions/profile'
import { useI18n } from '@/lib/i18n/provider'
import type { Profile } from '@/lib/supabase/types'

export function SettingsForm({ profile }: { profile: Profile }) {
  const { t, locale } = useI18n()
  const [fullName, setFullName] = useState(profile.full_name)
  const [bio, setBio] = useState(profile.bio ?? '')
  const [phone, setPhone] = useState(profile.phone ?? '')
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(profile.email_notifications_enabled)
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
    const result = await updateProfileAction({ fullName, bio, phone, locale, emailNotificationsEnabled, ...location })
    setSubmitting(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success(t('settings.updated'))
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fullName">{t('settings.fullName')}</Label>
        <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bio">{t('settings.bio')}</Label>
        <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">{t('settings.phone')}</Label>
        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>

      <LocationPicker value={location} onChange={setLocation} />

      <label className="flex items-center gap-2 text-sm">
        <Checkbox checked={emailNotificationsEnabled} onCheckedChange={(v) => setEmailNotificationsEnabled(!!v)} />
        {t('settings.emailNotifications')}
      </label>

      <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
        {submitting && <Loader2 className="animate-spin" size={16} />}
        {t('settings.saveChanges')}
      </Button>
    </form>
  )
}
