import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { isOwnerOf } from '@/lib/services/brand-owners'
import { getImpersonatedBrandSlug } from './impersonation'

vi.mock('@/lib/services/brand-owners', () => ({ isOwnerOf: vi.fn() }))
vi.mock('./impersonation', () => ({ getImpersonatedBrandSlug: vi.fn() }))

describe('admin authorization', () => {
  beforeEach(() => {
    process.env.ADMIN_EMAILS = 'admin@formoria.com'
    ;(isOwnerOf as Mock).mockReset()
    ;(getImpersonatedBrandSlug as Mock).mockReset()
  })

  it('recognizes configured admins without a separate mode cookie', async () => {
    const { isActingAsAdmin } = await import('./admin-mode')

    expect(await isActingAsAdmin('admin@formoria.com')).toBe(true)
    expect(await isActingAsAdmin('user@example.com')).toBe(false)
    expect(await isActingAsAdmin(null)).toBe(false)
  })

  it('allows a brand owner or configured admin to manage a brand', async () => {
    const { canManageBrand } = await import('./admin-mode')

    ;(isOwnerOf as Mock).mockResolvedValue(true)
    expect(await canManageBrand('u1', 'user@example.com', 'b1')).toBe(true)

    ;(isOwnerOf as Mock).mockResolvedValue(false)
    expect(await canManageBrand('u1', 'admin@formoria.com', 'b1')).toBe(true)
    expect(await canManageBrand('u1', 'user@example.com', 'b1')).toBe(false)
  })

  it('requires matching impersonation to manage a non-owned dashboard brand', async () => {
    const { canManageDashboardBrand } = await import('./admin-mode')
    ;(isOwnerOf as Mock).mockResolvedValue(false)
    ;(getImpersonatedBrandSlug as Mock).mockResolvedValue(null)

    expect(
      await canManageDashboardBrand('u1', 'admin@formoria.com', 'b1', 'brand-one')
    ).toBe(false)

    ;(getImpersonatedBrandSlug as Mock).mockResolvedValue('brand-one')
    expect(
      await canManageDashboardBrand('u1', 'admin@formoria.com', 'b1', 'brand-one')
    ).toBe(true)
  })
})
