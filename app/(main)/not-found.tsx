import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <BookOpen size={32} className="text-primary" />
      <h1 className="font-serif text-2xl">Page not found</h1>
      <p className="text-sm text-muted-foreground">This page doesn't exist, or may have been moved.</p>
      <Link href="/">
        <Button>Back to BookBridge</Button>
      </Link>
    </div>
  )
}
