/**
 * Product-type category list derived from the static ontology.
 */

import { PRODUCT_TYPE_CATEGORIES } from '@/lib/taxonomy/ontology'

export type CategoryOption = {
  slug: string
  name: string
  nameZh: string | null
}

/**
 * Returns the list of active product-type categories.
 * Derived from the static ontology — no database query needed.
 */
export function getActiveCategories(): Promise<CategoryOption[]> {
  return Promise.resolve(
    PRODUCT_TYPE_CATEGORIES.map((c) => ({
      slug: c.slug,
      name: c.name,
      nameZh: c.nameZh,
    }))
  )
}
