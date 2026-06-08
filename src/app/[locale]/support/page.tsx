import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { buildAlternates } from '@/lib/seo/alternates'
import type { Locale } from '@/lib/seo/alternates'

type PageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const safeLocale = (locale === 'en' ? 'en' : 'zh-TW') as Locale
  const t = await getTranslations('legal.support.metadata')
  const { canonical, languages } = buildAlternates('/support', safeLocale)
  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical, languages },
  }
}

export default async function SupportPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('legal.support')

  return (
    <main className="mx-auto w-full max-w-screen-xl px-6 py-10 md:px-10">
      <div className="space-y-16">
        {/* Hero */}
        <section className="space-y-4">
          <h1 className="font-heading text-[26px] font-bold text-foreground">
            {t('hero.title')}
          </h1>
          <p className="font-sans text-sm text-muted-foreground leading-[1.7] max-w-2xl">
            {t('hero.body')}
          </p>
          <div className="pt-2">
            <a
              href="https://buymeacoffee.com/ytchou"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {t('cta')}
            </a>
          </div>
        </section>

        {/* Where support goes */}
        <section className="space-y-6 border-t border-border pt-12">
          <h2 className="font-heading text-xl font-bold text-foreground">
            {t('usage.heading')}
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-6 space-y-3">
              <h3 className="font-heading text-base font-bold text-foreground">
                {t('usage.discover.title')}
              </h3>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                {t('usage.discover.body')}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 space-y-3">
              <h3 className="font-heading text-base font-bold text-foreground">
                {t('usage.hosting.title')}
              </h3>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                {t('usage.hosting.body')}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 space-y-3">
              <h3 className="font-heading text-base font-bold text-foreground">
                {t('usage.neutral.title')}
              </h3>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                {t('usage.neutral.body')}
              </p>
            </div>
          </div>
        </section>

        {/* Other ways to help */}
        <section className="space-y-4 border-t border-border pt-12">
          <h2 className="font-heading text-xl font-bold text-foreground">
            {t('otherWays.heading')}
          </h2>
          <ul className="space-y-3">
            <li>
              <Link
                href="/submit"
                className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline transition-colors"
              >
                {t('otherWays.submit')}
              </Link>
            </li>
            <li>
              <span className="text-sm text-muted-foreground">
                {t('otherWays.share')}
              </span>
            </li>
          </ul>
        </section>
      </div>
    </main>
  )
}
