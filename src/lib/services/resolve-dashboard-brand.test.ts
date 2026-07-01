import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  cache: <T extends (...args: never[]) => unknown>(fn: T) => fn,
}))

const {
  getUserBrands,
  getBrandBySlugForAdmin,
  isActingAsAdmin,
  getImpersonatedBrandSlug,
} = vi.hoisted(() => ({
  getUserBrands: vi.fn(),
  getBrandBySlugForAdmin: vi.fn(),
  isActingAsAdmin: vi.fn(),
  getImpersonatedBrandSlug: vi.fn(),
}))

vi.mock('@/lib/services/brand-owners', () => ({
  getUserBrands,
  getBrandBySlugForAdmin,
}))
vi.mock('@/lib/auth/admin-mode', () => ({ isActingAsAdmin }))
vi.mock('@/lib/auth/impersonation', () => ({ getImpersonatedBrandSlug }))

import { resolveDashboardBrand } from './resolve-dashboard-brand'

const ownedBrand = {
  brandId: 'owned-id',
  brandName: 'Owned Brand',
  brandSlug: 'owned-brand',
  heroImageUrl: null,
  claimedAt: '2026-01-01',
}
const otherBrand = {
  brandId: 'other-id',
  brandName: 'Other Brand',
  brandSlug: 'other-brand',
  heroImageUrl: null,
  claimedAt: '2026-01-01',
}

describe('resolveDashboardBrand', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getUserBrands.mockResolvedValue([ownedBrand])
    getImpersonatedBrandSlug.mockResolvedValue(null)
    isActingAsAdmin.mockResolvedValue(true)
    getBrandBySlugForAdmin.mockResolvedValue(otherBrand)
  })

  it('allows selecting a brand owned by the user', async () => {
    const result = await resolveDashboardBrand('user-1', 'admin@example.com', 'owned-brand')

    expect(result?.brand).toEqual(ownedBrand)
    expect(result?.isImpersonating).toBe(false)
  })

  it('ignores a non-owned query-string brand even for an admin', async () => {
    const result = await resolveDashboardBrand('user-1', 'admin@example.com', 'other-brand')

    expect(result?.brand).toEqual(ownedBrand)
    expect(result?.isImpersonating).toBe(false)
    expect(getBrandBySlugForAdmin).not.toHaveBeenCalled()
  })

  it('loads a non-owned brand only through active impersonation', async () => {
    getImpersonatedBrandSlug.mockResolvedValue('other-brand')

    const result = await resolveDashboardBrand('user-1', 'admin@example.com', 'owned-brand')

    expect(result?.brand).toEqual(otherBrand)
    expect(result?.isImpersonating).toBe(true)
  })

  it('marks impersonation active even when the admin also owns the brand', async () => {
    getImpersonatedBrandSlug.mockResolvedValue('owned-brand')

    const result = await resolveDashboardBrand('user-1', 'admin@example.com')

    expect(result?.brand).toEqual(ownedBrand)
    expect(result?.isImpersonating).toBe(true)
  })
})
