import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Gift, MessageCircle, PackageCheck, Search, ShieldCheck, Users } from 'lucide-react'
import { getServerTranslator } from '@/lib/i18n/server'

export const metadata: Metadata = { title: 'How It Works — BookBridge' }

export default async function HowItWorksPage() {
  const { dict, t } = await getServerTranslator()

  const donorSteps = [
    { title: dict.howItWorks.donorStep1Title, body: dict.howItWorks.donorStep1Body },
    { title: dict.howItWorks.donorStep2Title, body: dict.howItWorks.donorStep2Body },
    { title: dict.howItWorks.donorStep3Title, body: dict.howItWorks.donorStep3Body },
    { title: dict.howItWorks.donorStep4Title, body: dict.howItWorks.donorStep4Body },
    { title: dict.howItWorks.donorStep5Title, body: dict.howItWorks.donorStep5Body },
  ]

  const beneficiarySteps = [
    { title: dict.howItWorks.beneficiaryStep1Title, body: dict.howItWorks.beneficiaryStep1Body },
    { title: dict.howItWorks.beneficiaryStep2Title, body: dict.howItWorks.beneficiaryStep2Body },
    { title: dict.howItWorks.beneficiaryStep3Title, body: dict.howItWorks.beneficiaryStep3Body },
    { title: dict.howItWorks.beneficiaryStep4Title, body: dict.howItWorks.beneficiaryStep4Body },
  ]

  return (
    <div className="content-section">
      <div className="section-heading">
        <div>
          <div className="eyebrow">{t('howItWorks.eyebrow')}</div>
          <h1 className="font-serif text-4xl">{t('howItWorks.title')}</h1>
          <p>{t('howItWorks.subtitle')}</p>
        </div>
      </div>

      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="flex items-center gap-2 font-serif text-2xl">
            <Gift size={20} className="text-primary" /> {t('howItWorks.ifDonating')}
          </h2>
          <ol className="mt-4 flex flex-col gap-4">
            {donorSteps.map((s, i) => (
              <li key={s.title} className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium">{s.title}</p>
                  <p className="text-sm text-muted-foreground">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link href="/donate" className="button button-primary mt-6">
            {t('howItWorks.donateBooksCta')} <ArrowRight size={16} />
          </Link>
        </div>

        <div>
          <h2 className="flex items-center gap-2 font-serif text-2xl">
            <Search size={20} className="text-primary" /> {t('howItWorks.ifLooking')}
          </h2>
          <ol className="mt-4 flex flex-col gap-4">
            {beneficiarySteps.map((s, i) => (
              <li key={s.title} className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium">{s.title}</p>
                  <p className="text-sm text-muted-foreground">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link href="/books" className="button button-secondary mt-6">
            {t('howItWorks.findBooksCta')} <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <section className="trust-section mt-12">
        <ShieldCheck size={28} />
        <div>
          <h2>{t('howItWorks.safetyTitle')}</h2>
          <p>{t('howItWorks.safetyBody')}</p>
        </div>
      </section>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border p-5">
          <PackageCheck size={18} className="text-primary" />
          <p className="mt-2 font-medium">{t('howItWorks.pickupOrDropoffTitle')}</p>
          <p className="text-sm text-muted-foreground">{t('howItWorks.pickupOrDropoffBody')}</p>
        </div>
        <div className="rounded-lg border border-border p-5">
          <MessageCircle size={18} className="text-primary" />
          <p className="mt-2 font-medium">{t('howItWorks.messagingTitle')}</p>
          <p className="text-sm text-muted-foreground">{t('howItWorks.messagingBody')}</p>
        </div>
        <div className="rounded-lg border border-border p-5">
          <Users size={18} className="text-primary" />
          <p className="mt-2 font-medium">{t('howItWorks.communityTitle')}</p>
          <p className="text-sm text-muted-foreground">{t('howItWorks.communityBody')}</p>
        </div>
      </div>
    </div>
  )
}
