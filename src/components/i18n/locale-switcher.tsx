'use client'

import { useLocale } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'

export function LocaleSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()

  return (
    <div className="flex items-center gap-2 text-sm">
      <Link
        href={pathname}
        locale="zh-TW"
        aria-current={locale === 'zh-TW' ? 'true' : undefined}
        className={
          locale === 'zh-TW'
            ? 'font-medium text-foreground'
            : 'text-muted-foreground hover:text-foreground transition-colors'
        }
      >
        中文
      </Link>
      <span className="text-muted-foreground/40" aria-hidden="true">
        /
      </span>
      <Link
        href={pathname}
        locale="en"
        aria-current={locale === 'en' ? 'true' : undefined}
        className={
          locale === 'en'
            ? 'font-medium text-foreground'
            : 'text-muted-foreground hover:text-foreground transition-colors'
        }
      >
        EN
      </Link>
    </div>
  )
}
