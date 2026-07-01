import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import { ImpersonationBanner } from '@/components/dashboard/impersonation-banner'
import { SyncHtmlLang } from '@/components/i18n/sync-html-lang'
import { Footer } from '@/components/navigation/footer'
import { MainNav } from '@/components/navigation/main-nav'
import { routing } from '@/i18n/routing'
import {
  getImpersonatedBrandSlug,
  getImpersonationExpiresAt,
} from '@/lib/auth/impersonation'
import { buildAlternates } from '@/lib/seo/alternates'
import type { Locale } from '@/lib/seo/alternates'
import { getBrandBySlugForAdmin } from '@/lib/services/brand-owners'
import { PRODUCT_TYPE_CATEGORIES } from '@/lib/taxonomy/ontology'

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
  const [messages, impersonatedBrandSlug, impersonationExpiresAt] = await Promise.all([
    getMessages(),
    getImpersonatedBrandSlug(),
    getImpersonationExpiresAt(),
  ])
  const impersonatedBrand = impersonatedBrandSlug
    ? await getBrandBySlugForAdmin(impersonatedBrandSlug)
    : null
  const tImpersonate = impersonatedBrand
    ? await getTranslations('impersonation')
    : null

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <SyncHtmlLang />
      {impersonatedBrand && impersonationExpiresAt && tImpersonate ? (
        <ImpersonationBanner
          brandName={impersonatedBrand.brandName}
          expiresAt={impersonationExpiresAt}
          labels={{
            banner: tImpersonate('banner', {
              brandName: impersonatedBrand.brandName,
            }),
            exit: tImpersonate('exit'),
            timeRemaining: tImpersonate.raw('timeRemaining'),
          }}
        />
      ) : null}
      <div className="relative z-50">
        <MainNav categories={[...PRODUCT_TYPE_CATEGORIES]} />
      </div>
      <div className="flex-1">{children}</div>
      <Footer />
    </NextIntlClientProvider>
  )
}
