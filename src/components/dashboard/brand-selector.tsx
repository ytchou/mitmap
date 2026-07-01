'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'

type Brand = {
  brandId: string
  brandName: string
  brandSlug: string
  heroImageUrl: string | null
  claimedAt: string
}

type BrandSelectorProps = {
  brands: Brand[]
  selectedSlug: string
}

export function BrandSelector({ brands, selectedSlug }: BrandSelectorProps) {
  const t = useTranslations('dashboard.brandSelector')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentSlug =
    selectedSlug || searchParams.get('brand') || brands[0]?.brandSlug || ''
  const selectedBrand =
    brands.find((brand) => brand.brandSlug === currentSlug) ?? brands[0]

  if (brands.length <= 1) {
    return (
      <h1 className="font-heading text-[22px] font-bold leading-tight text-foreground">
        {selectedBrand?.brandName}
      </h1>
    )
  }

  const handleChange = (newSlug: string | null) => {
    if (!newSlug) return
    router.replace(`${pathname}?brand=${newSlug}`)
  }

  return (
    <div className="min-w-0">
      <p className="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
        {t('title')}
      </p>
      <div className="mt-1.5">
        <Select value={currentSlug} onValueChange={handleChange}>
          <SelectTrigger
            aria-label={t('label')}
            className="h-12 min-w-[18rem] max-w-full rounded-xl border-border bg-background px-3 text-left font-heading text-lg font-bold text-foreground shadow-sm sm:min-w-[20rem]"
          >
            <span className="flex flex-1 text-left">{selectedBrand?.brandName}</span>
          </SelectTrigger>
          <SelectContent align="start" className="rounded-xl">
            {brands.map((brand) => (
              <SelectItem key={brand.brandId} value={brand.brandSlug}>
                {brand.brandName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
