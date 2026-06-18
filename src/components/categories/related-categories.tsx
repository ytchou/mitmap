import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

interface RelatedCategoriesProps {
  categories: Array<{ slug: string; name: string }>
}

export async function RelatedCategories({ categories }: RelatedCategoriesProps) {
  if (categories.length === 0) return null

  const t = await getTranslations('categories.relatedCategories')

  return (
    <section className="mt-10 rounded-xl bg-[#F5F4F1] px-4 py-5">
      <h2 className="font-heading text-base font-semibold text-foreground">
        {t('heading')}
      </h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/categories/${category.slug}`}
            className="rounded-full border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            {category.name}
          </Link>
        ))}
      </div>
    </section>
  )
}
