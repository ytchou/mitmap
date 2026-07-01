import { isOwnerOf } from '@/lib/services/brand-owners'
import { getImpersonatedBrandSlug } from './impersonation'
import { isAdmin } from './admin'

export async function isActingAsAdmin(
  email?: string | null
): Promise<boolean> {
  return !!email && isAdmin(email)
}

export async function canManageBrand(
  userId: string,
  email: string | null | undefined,
  brandId: string
): Promise<boolean> {
  return (await isOwnerOf(userId, brandId)) || (await isActingAsAdmin(email))
}

export async function canManageDashboardBrand(
  userId: string,
  email: string | null | undefined,
  brandId: string,
  brandSlug: string
): Promise<boolean> {
  if (await isOwnerOf(userId, brandId)) return true
  if (!(await isActingAsAdmin(email))) return false

  return (await getImpersonatedBrandSlug()) === brandSlug
}
