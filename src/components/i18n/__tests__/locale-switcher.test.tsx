// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { LocaleSwitcher } from '@/components/i18n/locale-switcher'

vi.mock('@/i18n/navigation', () => ({
  Link: ({
    children,
    href,
    locale,
  }: {
    children: React.ReactNode
    href: string
    locale?: string
  }) => <a href={locale ? `/${locale}${href}` : href}>{children}</a>,
  usePathname: () => '/',
}))

function renderAt(locale: string) {
  return render(
    <NextIntlClientProvider locale={locale} messages={{}}>
      <LocaleSwitcher />
    </NextIntlClientProvider>,
  )
}

describe('LocaleSwitcher', () => {
  it('offers both language options', () => {
    renderAt('zh-TW')
    expect(screen.getByRole('link', { name: /中文/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /EN/i })).toBeInTheDocument()
  })
})
