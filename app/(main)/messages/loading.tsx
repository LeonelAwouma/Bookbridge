import { Skeleton } from '@/components/ui/skeleton'
import { ListSkeleton } from '@/components/ui/page-skeleton'

export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <Skeleton className="h-8 w-40" />
      <ListSkeleton />
    </div>
  )
}
