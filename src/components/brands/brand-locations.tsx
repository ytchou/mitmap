import { MapPin } from 'lucide-react'
import type { Brand } from '@/lib/types'

interface BrandLocationsProps {
  brand: Brand
}

export function BrandLocations({ brand }: BrandLocationsProps) {
  if (brand.retailLocations.length === 0) return null

  return (
    <section>
      <h2 className="mb-3 font-[family-name:var(--font-heading)] text-lg font-bold text-foreground">
        Locations
      </h2>
      <div className="space-y-3">
        {brand.retailLocations.map((location, i) => (
          <div key={i} className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">{location.name}</p>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(location.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {location.address}
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
