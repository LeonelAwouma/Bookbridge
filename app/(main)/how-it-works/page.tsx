import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Gift, MessageCircle, PackageCheck, Search, ShieldCheck, Users } from 'lucide-react'

export const metadata: Metadata = { title: 'How It Works — BookBridge' }

const donorSteps = [
  { title: 'Create an account', body: 'Sign up in under a minute — email and a password is all you need.' },
  { title: 'List your books', body: 'Add photos, condition, subject, and your general location. Takes about two minutes.' },
  { title: 'Review requests', body: 'Beneficiaries nearby will request your books. Check their profile and accept or decline.' },
  { title: 'Message & hand over', body: 'Coordinate a safe pickup or drop-off through in-app messaging.' },
  { title: 'Mark it complete', body: 'Confirm the handover and watch your impact stats grow.' },
]

const beneficiarySteps = [
  { title: 'Create a profile', body: 'Tell us your education level or organization and your location.' },
  { title: 'Search & filter', body: 'Browse books by subject, level, language, or distance — or post what you need.' },
  { title: 'Request a book', body: 'Send a short note explaining why you need it.' },
  { title: 'Coordinate & confirm', body: 'Chat with the donor, agree on a handover, and confirm you received the books.' },
]

export default function HowItWorksPage() {
  return (
    <div className="content-section">
      <div className="section-heading">
        <div>
          <div className="eyebrow">Simple by design</div>
          <h1 className="font-serif text-4xl">How BookBridge works</h1>
          <p>A local, human way to give books a second life — no shipping, no fees.</p>
        </div>
      </div>

      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="flex items-center gap-2 font-serif text-2xl">
            <Gift size={20} className="text-primary" /> If you're donating
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
            Donate books <ArrowRight size={16} />
          </Link>
        </div>

        <div>
          <h2 className="flex items-center gap-2 font-serif text-2xl">
            <Search size={20} className="text-primary" /> If you're looking for books
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
            Find books <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <section className="trust-section mt-12">
        <ShieldCheck size={28} />
        <div>
          <h2>Meeting up safely</h2>
          <p>
            Choose a public, well-lit place — a school, library, or community center works well. Bring someone with you if
            possible. Keep the conversation inside BookBridge messaging until you're ready to share contact details, and
            trust your instincts: you can always report or block someone.
          </p>
        </div>
      </section>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border p-5">
          <PackageCheck size={18} className="text-primary" />
          <p className="mt-2 font-medium">Pickup or drop-off</p>
          <p className="text-sm text-muted-foreground">Donors choose what works for them — you'll always know before requesting.</p>
        </div>
        <div className="rounded-lg border border-border p-5">
          <MessageCircle size={18} className="text-primary" />
          <p className="mt-2 font-medium">Built-in messaging</p>
          <p className="text-sm text-muted-foreground">No phone numbers shared until you're both ready.</p>
        </div>
        <div className="rounded-lg border border-border p-5">
          <Users size={18} className="text-primary" />
          <p className="mt-2 font-medium">A trusted community</p>
          <p className="text-sm text-muted-foreground">Ratings, verified organizations, and moderation keep exchanges safe.</p>
        </div>
      </div>
    </div>
  )
}
