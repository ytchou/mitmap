// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BrandTagEditor } from '../brand-tag-editor'

const mockTags = [
  { id: 't1', name: 'Bags', nameZh: '包', slug: 'bags', category: 'product_type' as const, isActive: true, createdAt: '2026-01-01' },
  { id: 't2', name: 'Ceramics', nameZh: '陶瓷', slug: 'ceramics', category: 'product_type' as const, isActive: true, createdAt: '2026-01-01' },
  { id: 't3', name: '永續', nameZh: '永續', slug: 'sustainability', category: 'value' as const, isActive: true, createdAt: '2026-01-01' },
]

const mockBrand = {
  id: 'b1',
  name: 'Test Brand',
  tags: [mockTags[0]],
}

describe('BrandTagEditor', () => {
  it('renders tags grouped by category', () => {
    render(<BrandTagEditor brand={mockBrand} allTags={mockTags} onSave={vi.fn()} />)
    expect(screen.getByText('Bags')).toBeInTheDocument()
    expect(screen.getByText('Ceramics')).toBeInTheDocument()
    expect(screen.getByText('永續')).toBeInTheDocument()
  })

  it('marks assigned tags as selected', () => {
    render(<BrandTagEditor brand={mockBrand} allTags={mockTags} onSave={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Bags' })).toHaveClass('bg-[#1A1918]')
  })

  it('pre-selects current brand tags', () => {
    render(<BrandTagEditor brand={mockBrand} allTags={mockTags} onSave={vi.fn()} />)
    const bagsButton = screen.getByRole('button', { name: /bags/i })
    expect(bagsButton).toHaveClass('bg-[#1A1918]')
  })

  it('calls onSave with updated tag ids on submit', async () => {
    const onSave = vi.fn()
    render(<BrandTagEditor brand={mockBrand} allTags={mockTags} onSave={onSave} />)

    fireEvent.click(screen.getByRole('button', { name: /ceramics/i }))
    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(expect.arrayContaining(['t1', 't2']))
    })
  })
})
