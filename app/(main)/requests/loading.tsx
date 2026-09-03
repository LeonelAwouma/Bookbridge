import { Skeleton } from '@/components/ui/skeleton'
import { CardGridSkeleton } from '@/components/ui/page-skeleton'

export default function Loading() {
  return (
    <div className="content-section">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="mt-3 h-4 w-40" />
      <CardGridSkeleton count={6} />
    </div>
  )
}
