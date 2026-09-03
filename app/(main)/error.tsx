'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <AlertTriangle size={32} className="text-primary" />
      <h1 className="font-serif text-2xl">Something went wrong</h1>
      <p className="text-sm text-muted-foreground">
        We couldn't load this page. Please try again — if the problem continues, come back a little later.
      </p>
      <div className="flex gap-2">
        <Button onClick={reset}>Try again</Button>
        <Link href="/">
          <Button variant="outline">Go home</Button>
        </Link>
      </div>
    </div>
  )
}
