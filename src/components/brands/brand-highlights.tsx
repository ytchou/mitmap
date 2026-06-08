import { getTranslations } from 'next-intl/server'
import type { Brand } from '@/lib/types'

interface Props {
  brand: Brand
}

export async function BrandHighlights({ brand }: Props) {
  if (!brand.brandHighlights) return null
  const t = await getTranslations('brandDetail')
  return (
    <section>
      <h2 className="mb-3 font-heading text-base font-bold text-foreground">
        {t('sections.highlights')}
      </h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {brand.brandHighlights}
      </p>
    </section>
  )
}
