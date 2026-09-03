import { createClient } from './server'

export async function getPlatformImpact() {
  const supabase = await createClient()

  const [{ count: booksDonated }, { count: activeDonors }, { count: beneficiaries }, { count: schoolsSupported }, { data: cityRows }] =
    await Promise.all([
      supabase.from('books').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).gt('donations_completed_count', 0),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).gt('books_received_count', 0),
      supabase.from('organizations').select('id', { count: 'exact', head: true }).gt('books_received_count', 0),
      supabase.from('books').select('city, country'),
    ])

  const cities = new Set((cityRows ?? []).map((r) => r.city))
  const countries = new Set((cityRows ?? []).map((r) => r.country))

  return {
    booksDonated: booksDonated ?? 0,
    activeDonors: activeDonors ?? 0,
    beneficiaries: beneficiaries ?? 0,
    schoolsSupported: schoolsSupported ?? 0,
    citiesReached: cities.size,
    countriesReached: countries.size,
  }
}

export async function getCityImpact(city: string) {
  const supabase = await createClient()

  const [{ count: booksDonated }, { data: donorRows }, { count: schoolsSupported }] = await Promise.all([
    supabase.from('books').select('id', { count: 'exact', head: true }).eq('city', city).eq('status', 'completed'),
    supabase.from('books').select('donor_id').eq('city', city).eq('status', 'completed'),
    supabase.from('organizations').select('id', { count: 'exact', head: true }).eq('city', city).gt('books_received_count', 0),
  ])

  const donors = new Set((donorRows ?? []).map((r) => r.donor_id).filter(Boolean))

  return {
    booksDonated: booksDonated ?? 0,
    donors: donors.size,
    schoolsSupported: schoolsSupported ?? 0,
  }
}

export async function getCitiesWithActivity() {
  const supabase = await createClient()
  const { data } = await supabase.from('books').select('city, country')
  const seen = new Map<string, { city: string; country: string }>()
  for (const row of data ?? []) {
    if (!seen.has(row.city)) seen.set(row.city, { city: row.city, country: row.country })
  }
  return [...seen.values()]
}
