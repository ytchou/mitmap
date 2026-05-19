// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/admin'),
}))

import { AdminNav } from '../admin-nav'

describe('AdminNav', () => {
  it('renders all navigation links', () => {
    render(<AdminNav />)
    expect(screen.getByText('Dashboard')).toBeDefined()
    expect(screen.getByText('Submissions')).toBeDefined()
    expect(screen.getByText('Brands')).toBeDefined()
    expect(screen.getByText('Taxonomy')).toBeDefined()
  })

  it('renders Admin wordmark', () => {
    render(<AdminNav />)
    expect(screen.getByText('Admin')).toBeDefined()
  })

  it('highlights active link based on pathname', async () => {
    const { usePathname } = vi.mocked(await import('next/navigation'))
    usePathname.mockReturnValue('/admin/submissions')

    render(<AdminNav />)
    const submissionsLink = screen.getByText('Submissions').closest('a')
    expect(submissionsLink?.className).toContain('border-b')
  })

  it('links to correct paths', () => {
    render(<AdminNav />)
    expect(screen.getByText('Dashboard').closest('a')?.getAttribute('href')).toBe('/admin')
    expect(screen.getByText('Submissions').closest('a')?.getAttribute('href')).toBe('/admin/submissions')
    expect(screen.getByText('Brands').closest('a')?.getAttribute('href')).toBe('/admin/brands')
    expect(screen.getByText('Taxonomy').closest('a')?.getAttribute('href')).toBe('/admin/taxonomy')
  })
})
