import type { Metadata } from 'next'
import { BookOpen, Heart, School } from 'lucide-react'
import { getCityImpact } from '@/lib/supabase/impact-queries'

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params
  return { title: `Impact in ${decodeURIComponent(city)} — BookBridge` }
}

export default async function CityImpactPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params
  const cityName = decodeURIComponent(city)
  const impact = await getCityImpact(cityName)

  return (
    <div className="content-section">
      <div className="eyebrow">Local impact</div>
      <h1 className="font-serif text-4xl">Impact in {cityName}</h1>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border p-5">
          <BookOpen size={18} className="text-primary" />
          <p className="mt-3 font-serif text-3xl">{impact.booksDonated}</p>
          <p className="text-xs text-muted-foreground">Books donated</p>
        </div>
        <div className="rounded-lg border border-border p-5">
          <Heart size={18} className="text-primary" />
          <p className="mt-3 font-serif text-3xl">{impact.donors}</p>
          <p className="text-xs text-muted-foreground">Donors</p>
        </div>
        <div className="rounded-lg border border-border p-5">
          <School size={18} className="text-primary" />
          <p className="mt-3 font-serif text-3xl">{impact.schoolsSupported}</p>
          <p className="text-xs text-muted-foreground">Organizations supported</p>
        </div>
      </div>
    </div>
  )
}
