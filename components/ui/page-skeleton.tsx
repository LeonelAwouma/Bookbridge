import { Skeleton } from '@/components/ui/skeleton'

export function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="book-grid mt-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-xl border border-border p-3">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  )
}

export function ListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="mt-6 flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  )
}
