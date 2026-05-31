import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { buildAlternates } from '@/lib/seo/alternates'
import type { Locale } from '@/lib/seo/alternates'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

type LayoutProps = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const safeLocale = (locale === 'en' ? 'en' : 'zh-TW') as Locale
  const { canonical, languages } = buildAlternates('/', safeLocale)

  const ogLocale = safeLocale === 'zh-TW' ? 'zh_TW' : 'en_US'
  const ogAlternateLocale = safeLocale === 'zh-TW' ? 'en_US' : 'zh_TW'

  return {
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      locale: ogLocale,
      alternateLocale: [ogAlternateLocale],
    },
  }
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound()
  }
  setRequestLocale(locale)
  return <>{children}</>
}
