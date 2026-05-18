import type { Brand } from '@/lib/types'

interface BrandFounderProps {
  brand: Brand
}

export function BrandFounder({ brand }: BrandFounderProps) {
  if (!brand.founder) return null

  const initials = brand.founder.name.charAt(0)

  return (
    <section>
      <h2 className="mb-3 font-[family-name:var(--font-heading)] text-lg font-bold text-foreground">
        Founder Story
      </h2>
      <div className="flex items-start gap-4">
        {/* Avatar */}
        {brand.founder.avatarUrl ? (
          <img
            src={brand.founder.avatarUrl}
            alt={brand.founder.name}
            className="size-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
            <span className="text-sm font-bold text-muted-foreground">
              {initials}
            </span>
          </div>
        )}

        <div className="min-w-0 flex-1">
          {/* Name + title */}
          <p className="text-sm font-medium text-foreground">
            {brand.founder.name}
          </p>
          {brand.founder.title && (
            <p className="text-xs text-muted-foreground">{brand.founder.title}</p>
          )}

          {/* Quote */}
          {brand.founder.quote && (
            <blockquote className="mt-2 border-l-2 border-primary/30 pl-3 text-sm italic leading-relaxed text-muted-foreground">
              {brand.founder.quote}
            </blockquote>
          )}
        </div>
      </div>
    </section>
  )
}
