import type { Metadata } from 'next'
import { getAdminOverview } from '@/lib/supabase/admin-queries'
import { AdminBarChart } from '@/components/admin/admin-charts'

export const metadata: Metadata = { title: 'Admin — BookBridge' }

export default async function AdminOverviewPage() {
  const overview = await getAdminOverview()

  const stats = [
    { label: 'Total users', value: overview.totalUsers },
    { label: 'Total book listings', value: overview.totalBooks },
    { label: 'Completed donations', value: overview.completedDonations },
    { label: 'Open reports', value: overview.openReports },
  ]

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-border p-4">
            <p className="font-serif text-2xl">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-border p-4">
          <h2 className="text-sm font-medium">Donations by month</h2>
          <AdminBarChart data={overview.donationsByMonth} dataKey="count" nameKey="month" />
        </div>
        <div className="rounded-lg border border-border p-4">
          <h2 className="text-sm font-medium">Donations by city</h2>
          <AdminBarChart data={overview.donationsByCity} dataKey="count" nameKey="city" />
        </div>
        <div className="rounded-lg border border-border p-4 sm:col-span-2">
          <h2 className="text-sm font-medium">Donations by category</h2>
          <AdminBarChart data={overview.donationsByCategory} dataKey="count" nameKey="category" />
        </div>
      </div>
    </div>
  )
}
