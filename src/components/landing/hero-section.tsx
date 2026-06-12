import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

interface HeroSectionProps {
  brandCount: number
  categoryCount: number
}

export default async function HeroSection({ brandCount, categoryCount }: HeroSectionProps) {
  const t = await getTranslations('landing.hero')

  return (
    <section className="grid lg:grid-cols-[2fr_3fr]">
      <div className="relative min-h-[20rem] lg:min-h-[32rem]">
        <Image
          src="/images/hero-bg.png"
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover object-right"
        />
      </div>
      <div className="flex flex-col justify-center px-8 py-12 md:px-12 lg:py-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-cta">
            {t('eyebrow')}
          </p>
          <h1 className="mt-4 font-heading text-4xl font-bold leading-tight text-foreground md:text-5xl">
            {t('headline')}
          </h1>
          <p className="mt-4 text-base leading-[1.7] text-muted-foreground">
            {t('subheadline')}
          </p>
          <p className="mt-5 text-sm text-muted-foreground">
            {brandCount} {t('statsBrands')} · {categoryCount} {t('statsCategories')}
          </p>
          <Link
            href="/brands"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-cta px-8 py-3 text-base font-semibold text-cta-foreground transition-colors hover:bg-cta/90"
          >
            {t('cta')}
          </Link>
        </div>
      </div>
    </section>
  )
}
