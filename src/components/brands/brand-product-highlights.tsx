import Image from 'next/image'
import { Card } from '@/components/ui/card'
import type { Brand } from '@/lib/types'

interface BrandProductHighlightsProps {
  brand: Brand
}

export function BrandProductHighlights({ brand }: BrandProductHighlightsProps) {
  if (brand.productHighlights.length === 0) return null

  return (
    <section>
      <h2 className="mb-3 font-[family-name:var(--font-heading)] text-lg font-bold text-foreground">
        Product Highlights
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {brand.productHighlights.map((product, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="relative aspect-[4/3] bg-muted">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 200px"
              />
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-foreground">{product.name}</p>
              {product.description && (
                <p className="mt-1 text-xs text-muted-foreground">{product.description}</p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
