// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BrandFilterSidebar } from './brand-filter-sidebar'

const replace = vi.fn()
let query = ''

vi.mock('next/navigation', () => ({
  usePathname: () => '/brands',
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams(query),
}))

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: (namespace: string) => (key: string, values?: { count: number }) => {
    const messages: Record<string, string> = {
      'brands.filters.appliedCount': `${values?.count ?? 0} filters applied`,
      'brands.filters.clearAll': 'Clear all',
      'brands.filters.category': 'Category',
      'brands.filters.priceRange': 'Price range',
      'brands.filters.brandStatus': 'Brand status',
      'brands.verificationFilter.all': 'All',
      'brands.verificationFilter.mit-verified': 'MIT verified',
      'brands.verificationFilter.owned': 'Brand managed',
    }
    return messages[`${namespace}.${key}`] ?? key
  },
}))

describe('BrandFilterSidebar price range', () => {
  beforeEach(() => {
    query = ''
    replace.mockClear()
  })

  it('renders price ranges as tags and writes the selected values to the URL', async () => {
    const user = userEvent.setup()
    render(<BrandFilterSidebar categories={[]} />)

    await user.click(screen.getByRole('checkbox', { name: '$$' }))

    expect(replace).toHaveBeenCalledWith('/brands?price=2', { scroll: false })
  })

  it('counts and clears active price ranges', async () => {
    query = 'price=1%2C3'
    const user = userEvent.setup()
    render(<BrandFilterSidebar categories={[]} />)

    expect(screen.getByText('2 filters applied')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Clear all' }))

    expect(replace).toHaveBeenCalledWith('/brands', { scroll: false })
  })
})
