import type { Metadata } from 'next'
import { BookOpen, Heart, School } from 'lucide-react'
import { getCityImpact } from '@/lib/supabase/impact-queries'
import { getServerTranslator } from '@/lib/i18n/server'

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params
  return { title: `Impact in ${decodeURIComponent(city)} — BookBridge` }
}

export default async function CityImpactPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params
  const cityName = decodeURIComponent(city)
  const impact = await getCityImpact(cityName)
  const { t } = await getServerTranslator()

  return (
    <div className="content-section">
      <div className="eyebrow">{t('impact.localImpact')}</div>
      <h1 className="font-serif text-4xl">{t('impact.impactIn', { city: cityName })}</h1>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border p-5">
          <BookOpen size={18} className="text-primary" />
          <p className="mt-3 font-serif text-3xl">{impact.booksDonated}</p>
          <p className="text-xs text-muted-foreground">{t('impact.booksDonated')}</p>
        </div>
        <div className="rounded-lg border border-border p-5">
          <Heart size={18} className="text-primary" />
          <p className="mt-3 font-serif text-3xl">{impact.donors}</p>
          <p className="text-xs text-muted-foreground">{t('impact.donors')}</p>
        </div>
        <div className="rounded-lg border border-border p-5">
          <School size={18} className="text-primary" />
          <p className="mt-3 font-serif text-3xl">{impact.schoolsSupported}</p>
          <p className="text-xs text-muted-foreground">{t('impact.organizationsSupported')}</p>
        </div>
      </div>
    </div>
  )
}
