import { createServiceClient } from '@/lib/supabase/server'
import type { ImageProcessorConfig, ProcessedImage } from '@/lib/security/image-processor'

export const ALLOWED_UPLOAD_BUCKETS = ['brand-images', 'claim-proofs'] as const
export type AllowedUploadBucket = (typeof ALLOWED_UPLOAD_BUCKETS)[number]
const BRAND_IMAGES_BUCKET = ALLOWED_UPLOAD_BUCKETS[0]
const BRAND_IMAGES_PUBLIC_SEGMENT = `/storage/v1/object/public/${BRAND_IMAGES_BUCKET}/`
const BRAND_IMAGES_KEY_PREFIX = 'brands/'
const PRIVATE_UPLOAD_BUCKETS = new Set<AllowedUploadBucket>(['claim-proofs'])
const CLAIM_PROOF_IMAGE_CONFIG: Partial<ImageProcessorConfig> = {
  maxWidth: 2400,
  maxHeight: 2400,
  quality: 92,
}

function getBrandImagesPublicPrefix(): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''}${BRAND_IMAGES_PUBLIC_SEGMENT}`
}

export interface UploadResult {
  url?: string
  key?: string
}

interface UploadProcessedImageInput {
  bucket: AllowedUploadBucket
  path: string
  data: Buffer
  contentType: string
}

export function getUploadImageProcessingConfig(
  bucket: AllowedUploadBucket
): Partial<ImageProcessorConfig> {
  return bucket === 'claim-proofs' ? CLAIM_PROOF_IMAGE_CONFIG : {}
}

export function storageKeyFromPublicUrl(url: string): string | null {
  const prefix = getBrandImagesPublicPrefix()
  if (!url || !prefix || !url.startsWith(prefix)) {
    return null
  }

  const key = url.slice(prefix.length)
  if (!key || !key.startsWith(BRAND_IMAGES_KEY_PREFIX)) {
    return null
  }

  return key
}

export function diffRemovedImageUrls(
  prev: string[] | null | undefined,
  next: string[] | null | undefined
): string[] {
  const prevUrls = prev ?? []
  const nextUrls = next ?? []

  return prevUrls.filter((url) => !nextUrls.includes(url))
}

export async function deleteBrandImages(urls: string[]): Promise<void> {
  const keys = (urls ?? []).map(storageKeyFromPublicUrl).filter((key): key is string => Boolean(key))

  if (keys.length === 0) {
    return
  }

  try {
    const supabase = createServiceClient()
    const { error } = await supabase.storage.from(BRAND_IMAGES_BUCKET).remove(keys)

    if (error) {
      throw error
    }
  } catch (error) {
    console.error('Failed to delete brand images from storage', error)
  }
}

export function uploadProcessedImage(input: UploadProcessedImageInput): Promise<UploadResult>
export function uploadProcessedImage(
  processed: ProcessedImage,
  path: string,
  bucket: AllowedUploadBucket
): Promise<UploadResult>
export async function uploadProcessedImage(
  inputOrProcessed: UploadProcessedImageInput | ProcessedImage,
  path?: string,
  bucket?: AllowedUploadBucket
): Promise<UploadResult> {
  const supabase = createServiceClient()
  const input =
    'data' in inputOrProcessed
      ? inputOrProcessed
      : {
          bucket: bucket as AllowedUploadBucket,
          path: `${path}/${Date.now()}-${crypto.randomUUID()}.webp`,
          data: inputOrProcessed.buffer,
          contentType: 'image/webp',
        }

  const { data, error: uploadError } = await supabase.storage
    .from(input.bucket)
    .upload(input.path, input.data, {
      contentType: input.contentType,
      upsert: false,
    })

  if (uploadError) {
    throw uploadError
  }

  if (PRIVATE_UPLOAD_BUCKETS.has(input.bucket)) {
    return { key: data.path }
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(input.bucket).getPublicUrl(input.path)

  return {
    url: publicUrl,
  }
}
