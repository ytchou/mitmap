// @vitest-environment jsdom
import * as React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import en from '@/../messages/en.json'
import { BrandSelector } from '../brand-selector'

const mockReplace = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => new URLSearchParams('brand=brand-a'),
  usePathname: () => '/dashboard',
}))

vi.mock('@/components/ui/select', () => {
  const Select = ({
    value,
    onValueChange,
    children,
  }: {
    value: string
    onValueChange: (value: string) => void
    children: React.ReactNode
  }) => {
    const childArray = React.Children.toArray(children)
    const trigger = childArray[0] as React.ReactElement<{
      'aria-label'?: string
      className?: string
    }>
    const content = childArray[1] as React.ReactElement<{
      children: React.ReactNode
    }>

    return (
      <select
        aria-label={trigger.props['aria-label']}
        className={trigger.props.className}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
      >
        {content.props.children}
      </select>
    )
  }

  return {
    Select,
    SelectTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    SelectItem: ({
      value,
      children,
    }: {
      value: string
      children: React.ReactNode
    }) => <option value={value}>{children}</option>,
  }
})

const brands = [
  {
    brandId: '1',
    brandName: 'Brand A',
    brandSlug: 'brand-a',
    heroImageUrl: null,
    claimedAt: '2026-01-01',
  },
  {
    brandId: '2',
    brandName: 'Brand B',
    brandSlug: 'brand-b',
    heroImageUrl: null,
    claimedAt: '2026-01-02',
  },
]

describe('BrandSelector', () => {
  it('renders selected brand name', () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <BrandSelector brands={brands} selectedSlug="brand-a" />
      </NextIntlClientProvider>
    )
    expect(screen.getByText('Brand A')).toBeInTheDocument()
  })

  it('renders static heading when only one brand', () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <BrandSelector brands={[brands[0]]} selectedSlug="brand-a" />
      </NextIntlClientProvider>
    )
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    expect(screen.getByText('Brand A')).toBeInTheDocument()
  })

  it('renders select trigger when multiple brands', () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <BrandSelector brands={brands} selectedSlug="brand-a" />
      </NextIntlClientProvider>
    )
    expect(screen.getByText('Viewing as')).toBeInTheDocument()
    expect(
      screen.queryByText('Shown when this account can manage 2 brands.')
    ).not.toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Select brand' })).toBeInTheDocument()
  })

  it('updates the query string when a different brand is selected', async () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <BrandSelector brands={brands} selectedSlug="brand-a" />
      </NextIntlClientProvider>
    )

    fireEvent.change(screen.getByRole('combobox', { name: 'Select brand' }), {
      target: { value: 'brand-b' },
    })

    expect(mockReplace).toHaveBeenCalledWith('/dashboard?brand=brand-b')
  })
})
