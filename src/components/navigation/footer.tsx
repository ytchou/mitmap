import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

export function Footer() {
  const t = useTranslations('footer')

  const footerLinks = [
    { labelKey: 'about' as const, href: '/about' },
    { labelKey: 'terms' as const, href: '/terms' },
    { labelKey: 'contact' as const, href: 'mailto:patrick.ytchou@gmail.com' },
  ]

  return (
    <footer
      role="contentinfo"
      className="bg-accent text-accent-foreground py-6"
    >
      <div className="mx-auto max-w-screen-xl px-6 md:px-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-6">
          {footerLinks.map((link) =>
            link.href.startsWith('/') ? (
              <Link
                key={link.labelKey}
                href={link.href}
                className="text-sm text-accent-foreground/70 hover:text-accent-foreground transition-colors"
              >
                {t(link.labelKey)}
              </Link>
            ) : (
              <a
                key={link.labelKey}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-accent-foreground/70 hover:text-accent-foreground transition-colors"
              >
                {t(link.labelKey)}
              </a>
            )
          )}
        </div>
        <p className="text-xs text-accent-foreground/50">
          {t('copyright', { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  )
}
