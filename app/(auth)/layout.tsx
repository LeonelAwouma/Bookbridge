import Link from 'next/link'
import { BookOpen } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <div className="p-6">
        <Link href="/" className="brand inline-flex">
          <span className="brand-mark">
            <BookOpen size={20} />
          </span>
          <span>
            book<span>bridge</span>
          </span>
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </main>
  )
}
