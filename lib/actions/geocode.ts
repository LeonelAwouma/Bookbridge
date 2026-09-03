'use server'

interface ReverseGeocodeResult {
  country?: string
  city?: string
  region?: string
}

export async function reverseGeocodeAction(lat: number, lng: number): Promise<ReverseGeocodeResult> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
    const response = await fetch(url, {
      headers: { 'User-Agent': 'BookBridge/1.0 (education book donation platform)' },
      next: { revalidate: 3600 },
    })
    if (!response.ok) return {}
    const data = await response.json()
    const address = data.address ?? {}
    return {
      country: address.country,
      city: address.city ?? address.town ?? address.municipality ?? address.county,
      region: address.state ?? address.region,
    }
  } catch {
    return {}
  }
}
