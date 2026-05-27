import type { Metadata } from 'next'
import { buildWebSiteJsonLd } from '@/lib/json-ld'
import HeroSection from '@/components/landing/hero-section'
import TrustBar from '@/components/landing/trust-bar'
import Manifesto from '@/components/landing/manifesto'
import BrandShowcase from '@/components/shared/brand-showcase'
import FilterableBrandShowcase from '@/components/landing/filterable-brand-showcase'
import ValueChips from '@/components/landing/value-chips'
import DualCta from '@/components/landing/dual-cta'
import { getBrandStats, getBrands, getNewBrands } from '@/lib/services/brands'
import { getActiveCategories, getTags } from '@/lib/services/taxonomy'

export const revalidate = 3600

export const metadata: Metadata = {
  title: { absolute: 'MIT Map — 探索台灣製造品牌' },
  description:
    '探索並發現精選的台灣製造品牌。從食品到時尚，支持本土設計師和製造商。',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'MIT Map — 探索台灣製造品牌',
    description: '探索並發現精選的台灣製造品牌。從食品到時尚，支持本土設計師和製造商。',
  },
}

export default async function LandingPage() {
  const jsonLd = buildWebSiteJsonLd()

  const [stats, categories, { brands: allBrands }, newBrands, valueTags] = await Promise.all([
    getBrandStats(),
    getActiveCategories(),
    getBrands(),
    getNewBrands(4),
    getTags('value'),
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        <HeroSection />

        <div className="py-4">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <TrustBar brandCount={stats.brandCount} categoryCount={stats.categoryCount} />
          </div>
        </div>

        <div className="py-6 md:py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <Manifesto />
          </div>
        </div>

        <div className="py-6 md:py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <FilterableBrandShowcase brands={allBrands} categories={categories} />
          </div>
        </div>

        <div className="py-6 md:py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <ValueChips tags={valueTags} />
          </div>
        </div>

        <div className="py-6 md:py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <BrandShowcase
              brands={newBrands}
              heading="最新品牌"
              linkText="瀏覽全部品牌 →"
              linkHref="/brands"
            />
          </div>
        </div>

        <DualCta />
      </main>
    </>
  )
}
