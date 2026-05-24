'use client'

import Link from 'next/link'
import { trackCategoryFilterApplied } from '@/lib/analytics'

interface CategoryNavProps {
  categories: Array<{ slug: string; name: string }>
}

export function CategoryNav({ categories }: CategoryNavProps) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
        {categories.map(({ slug, name }) => (
          <Link
            key={slug}
            href={`/brands?category=${encodeURIComponent(slug)}`}
            onClick={() => trackCategoryFilterApplied(slug)}
            className="inline-flex items-center rounded-full border border-[#E5E4E1] px-5 py-2 text-base font-[family-name:var(--font-heading)] text-[#1A1918] transition-colors hover:border-[#E06B3F] hover:text-[#E06B3F] whitespace-nowrap"
          >
            {name}
          </Link>
        ))}
      </div>
    </div>
  )
}
