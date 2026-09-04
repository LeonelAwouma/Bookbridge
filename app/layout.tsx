import { Analytics } from '@vercel/analytics/next'
import { DM_Sans, Fraunces } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import { Toaster } from 'sonner'
import { I18nProvider } from '@/lib/i18n/provider'
import { getServerLocale } from '@/lib/i18n/server'
import './globals.css'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' })
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces' })

export const metadata: Metadata = {
  title: 'BookBridge — Pass possibility on',
  description: 'A local book-sharing community connecting books with new readers across Africa.',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#fbfaf7',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getServerLocale()

  return (
    <html lang={locale} className={`bg-background ${dmSans.variable} ${fraunces.variable}`}>
      <body className="antialiased font-sans">
        <I18nProvider locale={locale}>
          {children}
          <Toaster position="top-center" richColors />
        </I18nProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
