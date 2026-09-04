import type { Metadata } from 'next'
import { FileText } from 'lucide-react'
import { getServerLocale, getServerTranslator } from '@/lib/i18n/server'

export const metadata: Metadata = { title: 'Terms of Service — BookBridge' }

const LAST_UPDATED = new Date('2026-09-04')

export default async function TermsPage() {
  const { dict, t } = await getServerTranslator()
  const locale = await getServerLocale()

  const sections = [
    { heading: dict.terms.section1Heading, body: dict.terms.section1Body },
    { heading: dict.terms.section2Heading, body: dict.terms.section2Body },
    { heading: dict.terms.section3Heading, body: dict.terms.section3Body },
    { heading: dict.terms.section4Heading, body: dict.terms.section4Body },
    { heading: dict.terms.section5Heading, body: dict.terms.section5Body },
    { heading: dict.terms.section6Heading, body: dict.terms.section6Body },
    { heading: dict.terms.section7Heading, body: dict.terms.section7Body },
  ]

  const lastUpdated = LAST_UPDATED.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <FileText size={28} className="text-primary" />
      <h1 className="mt-3 font-serif text-4xl">{dict.terms.title}</h1>
      <p className="mt-1 text-xs text-muted-foreground">{t('terms.lastUpdated', { date: lastUpdated })}</p>
      <p className="mt-4 text-sm leading-relaxed">{dict.terms.intro}</p>

      <div className="mt-8 flex flex-col gap-8">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-serif text-xl">{section.heading}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
          </section>
        ))}

        <section>
          <h2 className="font-serif text-xl">{dict.terms.contactHeading}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{dict.terms.contactBody}</p>
        </section>
      </div>
    </div>
  )
}
