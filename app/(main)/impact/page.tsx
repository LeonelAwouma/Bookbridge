import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, Globe2, Heart, MapPin, School, Users } from 'lucide-react'
import { getCitiesWithActivity, getPlatformImpact } from '@/lib/supabase/impact-queries'
import { getServerTranslator } from '@/lib/i18n/server'

export const metadata: Metadata = { title: 'Impact — BookBridge' }

export default async function ImpactPage() {
  const [impact, cities] = await Promise.all([getPlatformImpact(), getCitiesWithActivity()])
  const { t } = await getServerTranslator()

  const stats = [
    { label: t('impact.booksDonated'), value: impact.booksDonated, icon: BookOpen },
    { label: t('impact.activeDonors'), value: impact.activeDonors, icon: Heart },
    { label: t('impact.beneficiariesReached'), value: impact.beneficiaries, icon: Users },
    { label: t('impact.organizationsSupported'), value: impact.schoolsSupported, icon: School },
    { label: t('impact.citiesReached'), value: impact.citiesReached, icon: MapPin },
    { label: t('impact.countriesReached'), value: impact.countriesReached, icon: Globe2 },
  ]

  return (
    <div className="content-section">
      <div className="section-heading">
        <div>
          <div className="eyebrow">{t('impact.eyebrow')}</div>
          <h1 className="font-serif text-4xl">{t('impact.title')}</h1>
          <p>{t('impact.subtitle')}</p>
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
          <h2 className="font-serif text-2xl">{t('impact.impactByCity')}</h2>
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
