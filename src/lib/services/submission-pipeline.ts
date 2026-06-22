import type { Brand } from '@/lib/types'
import type { SourceAttribution } from '@/lib/types/submission'
import { createBrand, generateSlug } from '@/lib/services/brands'
import { createSubmission } from '@/lib/services/submissions'
import { createClient } from '@/lib/supabase/server'

export interface SubmitBrandForReviewParams {
  [key: string]: unknown
  name: string
  website?: string
  region: string
  isOwner?: boolean
  pdpaConsent?: boolean
  sourceAttribution?: SourceAttribution | null
  ubn?: string | null
  retailLocations?: Array<{ name: string; address: string; latitude?: number; longitude?: number }>
}

export interface SubmitBrandForReviewResult {
  brand: Brand
  submissionId: string
}

export async function submitBrandForReview(
  params: SubmitBrandForReviewParams
): Promise<SubmitBrandForReviewResult> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user?.email) {
    throw authError ?? new Error('Authenticated submitter email is required')
  }

  if (!params.website) {
    throw new Error('Brand website is required')
  }

  const retailLocations = (params.retailLocations ?? []).map((location) => ({
    ...location,
    latitude: 0,
    longitude: 0,
  }))
  const unifiedBusinessNumber = params.ubn ?? null

  const brand = await createBrand({
    name: params.name,
    slug: generateSlug(params.name),
    description: null,
    heroImageUrl: null,
    status: 'pending',
    isVerified: false,
    isDemo: false,
    category: null,
    foundingYear: null,
    socialInstagram: null,
    socialThreads: null,
    socialFacebook: null,
    purchaseWebsite: params.website,
    purchasePinkoi: null,
    purchaseShopee: null,
    otherUrls: [],
    retailLocations,
    productPhotos: [],
    contactEmail: user.email,
    brandHighlights: null,
    siteContent: null,
    unifiedBusinessNumber,
    productType: 'uncategorized',
  })

  const submission = await createSubmission({
    brandId: brand.id,
    brandName: params.name,
    submitterEmail: user.email,
    submitterName: user.user_metadata?.full_name ?? undefined,
    description: null,
    websiteUrl: params.website,
    socialInstagram: null,
    socialThreads: null,
    socialFacebook: null,
    purchaseWebsite: params.website,
    purchasePinkoi: null,
    purchaseShopee: null,
    otherUrls: [],
    suggestedTags: { region: params.region },
    isBrandOwner: params.isOwner ?? false,
    sourceAttribution: params.sourceAttribution ?? null,
    pdpaConsentAt: params.pdpaConsent ? new Date().toISOString() : undefined,
    productTypeNote: null,
    unifiedBusinessNumber: unifiedBusinessNumber ?? undefined,
  })

  return { brand, submissionId: submission.id }
}
