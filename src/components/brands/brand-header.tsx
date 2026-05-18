import { CheckCircle, MapPin } from 'lucide-react'
import type { Brand } from '@/lib/types'

interface BrandHeaderProps {
  brand: Brand
}

export function BrandHeader({ brand }: BrandHeaderProps) {
  const locationName = brand.retailLocations[0]?.name

  return (
    <div className="space-y-3">
      {/* Brand name */}
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold leading-tight text-foreground md:text-4xl">
        {brand.name}
      </h1>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        {/* Location */}
        {locationName && (
          <span className="flex items-center gap-1">
            <MapPin className="size-3.5" />
            {locationName}
          </span>
        )}

        {/* Category pill */}
        {brand.category && (
          <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
            {brand.category}
          </span>
        )}

        {/* Verified badge */}
        {brand.approvedAt && (
          <span className="flex items-center gap-1 text-primary">
            <CheckCircle className="size-3.5" />
            <span className="text-xs font-medium">Verified</span>
          </span>
        )}

        {/* Founding year */}
        {brand.foundingYear && (
          <span className="text-xs">Est. {brand.foundingYear}</span>
        )}
      </div>
    </div>
  )
}
