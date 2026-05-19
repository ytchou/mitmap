'use server'

import { fullSubmissionSchema, type SubmissionFormData } from '@/lib/validations/submission'
import { createBrand } from '@/lib/services/brands'
import { createSubmission } from '@/lib/services/submissions'
import { createClient } from '@/lib/supabase/server'

const IMAGE_FETCH_TIMEOUT_MS = 10_000

function getExtFromContentType(contentType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  }
  return map[contentType] ?? 'jpg'
}

export async function downloadAndStoreImages(
  urls: string[],
  brandId: string
): Promise<string[]> {
  if (urls.length === 0) return []

  const supabase = await createClient()

  const results = await Promise.allSettled(
    urls.map(async (url) => {
      const controller = new AbortController()
      const timeoutId = setTimeout(
        () => controller.abort(),
        IMAGE_FETCH_TIMEOUT_MS
      )

      try {
        const response = await fetch(url, { signal: controller.signal })
        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`)
        }

        const blob = await response.blob()
        const contentType =
          response.headers.get('content-type') ?? 'image/jpeg'
        const ext = getExtFromContentType(contentType)
        const filename = `brands/${brandId}/${crypto.randomUUID()}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('brand-images')
          .upload(filename, blob, { contentType })

        if (uploadError) {
          throw uploadError
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from('brand-images').getPublicUrl(filename)

        return publicUrl
      } catch (err) {
        clearTimeout(timeoutId)
        console.warn(`Failed to download image ${url}:`, err)
        throw err
      }
    })
  )

  return results
    .filter(
      (r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled'
    )
    .map((r) => r.value)
}

export async function submitBrand(
  data: SubmissionFormData
): Promise<{ error: string } | undefined> {
  try {
    // Server-side validation
    const parsed = fullSubmissionSchema.parse(data)

    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'You must be logged in to submit a brand' }
    }

    // Create brand with pending status
    await createBrand({
      name: parsed.name,
      slug: '',
      description: parsed.description,
      logoUrl: parsed.logoUrl,
      heroImageUrl: null,
      status: 'pending',
      category: parsed.category,
      foundingYear: null,
      purchaseLinks: parsed.purchaseLinks.map((l) => ({
        ...l,
        label: l.platform,
      })),
      socialLinks: {
        instagram: parsed.socialLinks.instagram || undefined,
        threads: parsed.socialLinks.threads || undefined,
        facebook: parsed.socialLinks.facebook || undefined,
        officialWebsite: parsed.socialLinks.website || undefined,
      },
      retailLocations: parsed.retailLocations.map((loc) => ({
        ...loc,
        latitude: 0,
        longitude: 0,
      })),
      productPhotos: parsed.productPhotos,
      contactEmail: user.email ?? null,
      founder: null,
      productHighlights: [],
    })

    // Create submission audit record
    await createSubmission({
      brandName: parsed.name,
      submitterEmail: user.email ?? '',
      submitterName: user.user_metadata?.full_name ?? null,
      description: parsed.description,
      websiteUrl: parsed.socialLinks.website || null,
      socialLinks: {
        instagram: parsed.socialLinks.instagram || undefined,
        threads: parsed.socialLinks.threads || undefined,
        facebook: parsed.socialLinks.facebook || undefined,
        officialWebsite: parsed.socialLinks.website || undefined,
      },
      suggestedTags: parsed.tags,
      pdpaConsentAt: new Date().toISOString(),
    })

    return undefined // Success — no error
  } catch (err) {
    console.error('Submit brand error:', err)
    return {
      error:
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred. Please try again.',
    }
  }
}
