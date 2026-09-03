'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { LocationPicker, emptyLocation, type LocationValue } from '@/components/location/location-picker'
import { completeOnboardingAction } from '@/lib/actions/profile'
import type { UserType } from '@/lib/supabase/types'

export function OnboardingForm({ userType }: { userType: UserType }) {
  const router = useRouter()
  const [location, setLocation] = useState<LocationValue>(emptyLocation)
  const [bio, setBio] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!location.country || !location.city) {
      setError('Please select at least your country and city.')
      return
    }
    setSubmitting(true)
    setError(null)
    const result = await completeOnboardingAction({ ...location, bio })
    setSubmitting(false)
    if (result.error) {
      setError(result.error)
      return
    }
    router.push(userType === 'individual' ? '/dashboard' : '/organizations/new')
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-2xl">Where are you located?</CardTitle>
        <CardDescription>
          This helps us show you books and requests nearby. Your exact address is never shown publicly.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <LocationPicker value={location} onChange={setLocation} />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bio">Short bio (optional)</Label>
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A sentence about you or your organization" />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting && <Loader2 className="animate-spin" size={16} />}
            Continue
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
