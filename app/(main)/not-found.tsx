import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getServerTranslator } from '@/lib/i18n/server'

export default async function NotFound() {
  const { t } = await getServerTranslator()

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <BookOpen size={32} className="text-primary" />
      <h1 className="font-serif text-2xl">{t('common.pageNotFound')}</h1>
      <p className="text-sm text-muted-foreground">{t('common.pageNotFoundBody')}</p>
      <Link href="/">
        <Button>{t('common.goHome')}</Button>
      </Link>
    </div>
  )
}
