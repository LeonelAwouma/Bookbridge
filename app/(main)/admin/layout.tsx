import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/supabase/admin-queries'

const links = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/organizations', label: 'Organizations' },
  { href: '/admin/reports', label: 'Reports' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin()
  if (!admin) redirect('/dashboard')

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <div className="eyebrow">Admin</div>
      <h1 className="mt-1 font-serif text-3xl">Moderation & analytics</h1>
      <nav className="mt-6 flex gap-1 border-b border-border">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="mt-6">{children}</div>
    </div>
  )
}
