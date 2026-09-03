'use client'

import { useMemo, useState } from 'react'
import { LocateFixed, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { countries, regionsFor, citiesFor } from '@/lib/data/locations'
import { reverseGeocodeAction } from '@/lib/actions/geocode'
import { useI18n } from '@/lib/i18n/provider'

export interface LocationValue {
  country: string
  region: string
  city: string
  neighborhood: string
  latitude: number | null
  longitude: number | null
}

export const emptyLocation: LocationValue = { country: '', region: '', city: '', neighborhood: '', latitude: null, longitude: null }

export function LocationPicker({ value, onChange }: { value: LocationValue; onChange: (value: LocationValue) => void }) {
  const { t } = useI18n()
  const [locating, setLocating] = useState(false)
  const [locateError, setLocateError] = useState<string | null>(null)

  const regionOptions = useMemo(() => regionsFor(value.country).map((r) => r.name), [value.country])
  const cityOptions = useMemo(
    () => (value.region ? citiesFor(value.country, value.region) : regionsFor(value.country).flatMap((r) => r.cities)),
    [value.country, value.region],
  )

  function useMyLocation() {
    if (!('geolocation' in navigator)) {
      setLocateError(t('common.locationUnsupported'))
      return
    }
    setLocating(true)
    setLocateError(null)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        const result = await reverseGeocodeAction(latitude, longitude)
        const matchedCountry = countries.find((c) => c.name.toLowerCase() === result.country?.toLowerCase())
        onChange({
          ...value,
          latitude,
          longitude,
          country: matchedCountry?.name ?? value.country,
          city: result.city ?? value.city,
          region: result.region ?? value.region,
        })
        setLocating(false)
      },
      () => {
        setLocateError(t('common.locationError'))
        setLocating(false)
      },
      { enableHighAccuracy: false, timeout: 8000 },
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="loc-country">{t('common.country')}</Label>
          <Select value={value.country} onValueChange={(country) => onChange({ ...value, country: country ?? '', region: '', city: '' })}>
            <SelectTrigger id="loc-country" className="w-full">
              <SelectValue placeholder={t('common.country')} />
            </SelectTrigger>
            <SelectContent>
              {countries.map((c) => (
                <SelectItem key={c.code} value={c.name}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="loc-region">{t('common.region')}</Label>
          <Input
            id="loc-region"
            list="region-options"
            value={value.region}
            onChange={(e) => onChange({ ...value, region: e.target.value })}
            disabled={!value.country}
          />
          <datalist id="region-options">
            {regionOptions.map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="loc-city">{t('common.city')}</Label>
          <Input
            id="loc-city"
            list="city-options"
            value={value.city}
            onChange={(e) => onChange({ ...value, city: e.target.value })}
            disabled={!value.country}
          />
          <datalist id="city-options">
            {cityOptions.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="loc-neighborhood">{t('common.neighborhood')}</Label>
          <Input id="loc-neighborhood" value={value.neighborhood} onChange={(e) => onChange({ ...value, neighborhood: e.target.value })} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Button type="button" variant="outline" size="sm" className="w-fit" onClick={useMyLocation} disabled={locating}>
          {locating ? <Loader2 size={14} className="animate-spin" /> : <LocateFixed size={14} />}
          {t('common.useMyLocation')}
        </Button>
        {locateError && <p className="text-xs text-destructive">{locateError}</p>}
        {value.latitude && value.longitude && !locateError && (
          <p className="text-xs text-muted-foreground">{t('common.locationCaptured')}</p>
        )}
      </div>
    </div>
  )
}
