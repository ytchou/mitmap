import type { MetadataRoute } from 'next'
import { getAllBrandSlugs } from '@/lib/services/brands'
import { getActiveCategories } from '@/lib/services/taxonomy'
import { buildAlternates } from '@/lib/seo/alternates'

export const revalidate = 86400 // 24hr ISR

function makeEntry(
  siteUrl: string,
  path: string,
  now: Date,
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'],
  priority: number
): MetadataRoute.Sitemap[number] {
  const { languages } = buildAlternates(path, 'zh-TW')
  // Sitemap canonical = zh-TW (prefix-free) URL
  const url = languages['zh-TW']
  return {
    url,
    lastModified: now,
    changeFrequency,
    priority,
    alternates: {
      languages: {
        'zh-TW': languages['zh-TW'],
        en: languages['en'],
      },
    },
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    makeEntry(siteUrl, '/', now, 'daily', 1.0),
    makeEntry(siteUrl, '/brands', now, 'weekly', 0.9),
    makeEntry(siteUrl, '/faq', now, 'monthly', 0.5),
    makeEntry(siteUrl, '/terms', now, 'monthly', 0.5),
    makeEntry(siteUrl, '/support', now, 'monthly', 0.5),
  ]

  try {
    const [brandSlugs, categories] = await Promise.all([
      getAllBrandSlugs(),
      getActiveCategories(),
    ])

    const brandPages: MetadataRoute.Sitemap = brandSlugs.map((slug) =>
      makeEntry(siteUrl, `/brands/${slug}`, now, 'weekly', 0.8)
    )

    const categoryPages: MetadataRoute.Sitemap = categories.map(({ slug }) =>
      makeEntry(siteUrl, `/categories/${slug}`, now, 'weekly', 0.9)
    )

    return [...staticPages, ...brandPages, ...categoryPages]
  } catch {
    // Fallback: static pages only (DB unavailable)
    return staticPages
  }
}
