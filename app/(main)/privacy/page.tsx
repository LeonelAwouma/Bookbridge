import type { Metadata } from 'next'
import { ShieldCheck } from 'lucide-react'
import { getServerLocale, getServerTranslator } from '@/lib/i18n/server'

export const metadata: Metadata = { title: 'Privacy Policy — BookBridge' }

const LAST_UPDATED = new Date('2026-09-03')

export default async function PrivacyPage() {
  const { dict, t } = await getServerTranslator()
  const locale = await getServerLocale()

  const sections = [
    { heading: dict.privacy.section1Heading, body: dict.privacy.section1Body },
    { heading: dict.privacy.section2Heading, body: dict.privacy.section2Body },
    { heading: dict.privacy.section3Heading, body: dict.privacy.section3Body },
    { heading: dict.privacy.section4Heading, body: dict.privacy.section4Body },
    { heading: dict.privacy.section5Heading, body: dict.privacy.section5Body },
    { heading: dict.privacy.section6Heading, body: dict.privacy.section6Body },
  ]

  const lastUpdated = LAST_UPDATED.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <ShieldCheck size={28} className="text-primary" />
      <h1 className="mt-3 font-serif text-4xl">{dict.privacy.title}</h1>
      <p className="mt-1 text-xs text-muted-foreground">{t('privacy.lastUpdated', { date: lastUpdated })}</p>
      <p className="mt-4 text-sm leading-relaxed">{dict.privacy.intro}</p>

      <div className="mt-8 flex flex-col gap-8">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-serif text-xl">{section.heading}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
          </section>
        ))}

        <section>
          <h2 className="font-serif text-xl">{dict.privacy.contactHeading}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{dict.privacy.contactBody}</p>
        </section>
      </div>
    </div>
  )
}
