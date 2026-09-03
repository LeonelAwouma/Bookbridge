import { createClient } from './server'

export async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  return profile?.is_admin ? profile : null
}

export async function getAdminOverview() {
  const supabase = await createClient()

  const [{ count: totalUsers }, { count: totalBooks }, { count: completedDonations }, { count: openReports }, { data: completedBooks }] =
    await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('books').select('id', { count: 'exact', head: true }),
      supabase.from('donation_requests').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
      supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('books').select('created_at, city, category').eq('status', 'completed').limit(1000),
    ])

  const byMonth = new Map<string, number>()
  const byCity = new Map<string, number>()
  const byCategory = new Map<string, number>()

  for (const row of completedBooks ?? []) {
    const month = row.created_at.slice(0, 7)
    byMonth.set(month, (byMonth.get(month) ?? 0) + 1)
    byCity.set(row.city, (byCity.get(row.city) ?? 0) + 1)
    byCategory.set(row.category, (byCategory.get(row.category) ?? 0) + 1)
  }

  const donationsByMonth = [...byMonth.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-6).map(([month, count]) => ({ month, count }))
  const donationsByCity = [...byCity.entries()].sort(([, a], [, b]) => b - a).slice(0, 6).map(([city, count]) => ({ city, count }))
  const donationsByCategory = [...byCategory.entries()].sort(([, a], [, b]) => b - a).slice(0, 6).map(([category, count]) => ({ category, count }))

  return {
    totalUsers: totalUsers ?? 0,
    totalBooks: totalBooks ?? 0,
    completedDonations: completedDonations ?? 0,
    openReports: openReports ?? 0,
    donationsByMonth,
    donationsByCity,
    donationsByCategory,
  }
}
