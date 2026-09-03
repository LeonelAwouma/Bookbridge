import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, Globe2, Heart, MapPin, School, Users } from 'lucide-react'
import { getCitiesWithActivity, getPlatformImpact } from '@/lib/supabase/impact-queries'

export const metadata: Metadata = { title: 'Impact — BookBridge' }

export default async function ImpactPage() {
  const [impact, cities] = await Promise.all([getPlatformImpact(), getCitiesWithActivity()])

  const stats = [
    { label: 'Books donated', value: impact.booksDonated, icon: BookOpen },
    { label: 'Active donors', value: impact.activeDonors, icon: Heart },
    { label: 'Beneficiaries reached', value: impact.beneficiaries, icon: Users },
    { label: 'Organizations supported', value: impact.schoolsSupported, icon: School },
    { label: 'Cities reached', value: impact.citiesReached, icon: MapPin },
    { label: 'Countries reached', value: impact.countriesReached, icon: Globe2 },
  ]

  return (
    <div className="content-section">
      <div className="section-heading">
        <div>
          <div className="eyebrow">Our impact</div>
          <h1 className="font-serif text-4xl">Education, shared locally.</h1>
          <p>Every number here represents a book that found a new reader instead of collecting dust.</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-border p-5">
            <s.icon size={18} className="text-primary" />
            <p className="mt-3 font-serif text-3xl">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {cities.length > 0 && (
        <section className="mt-12">
          <h2 className="font-serif text-2xl">Impact by city</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {cities.map((c) => (
              <Link key={c.city} href={`/impact/${encodeURIComponent(c.city)}`} className="category">
                {c.city}, {c.country}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
