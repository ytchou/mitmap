import { createServiceClient } from '@/lib/supabase/server'

const DEEPSEEK_MODEL = 'deepseek-v4-flash'

export type AiTriageInput = {
  brandId: string
  isNonBrand: boolean
  nonBrandReason: string | null
  slugGenerated: string | null
  productType: string | null
  confidence: 'high' | 'medium' | 'low'
  valueTags: string[]
  rawResponse?: unknown
}

export type AiDescriptionInput = {
  brandId: string
  description: string
  productType?: string | null
  confidence?: 'high' | 'medium' | 'low'
  rawResponse?: unknown
}

export async function insertTriageResult(input: AiTriageInput): Promise<void> {
  const supabase = createServiceClient()
  await supabase.from('brand_ai_results').insert({
    brand_id: input.brandId,
    phase: 'triage',
    is_non_brand: input.isNonBrand,
    non_brand_reason: input.nonBrandReason,
    slug_generated: input.slugGenerated,
    product_type: input.productType,
    confidence: input.confidence,
    value_tags: input.valueTags,
    model: DEEPSEEK_MODEL,
    raw_response: input.rawResponse ?? null,
  } as never)
}

export async function insertDescriptionResult(input: AiDescriptionInput): Promise<void> {
  const supabase = createServiceClient()
  await supabase.from('brand_ai_results').insert({
    brand_id: input.brandId,
    phase: 'description',
    description: input.description,
    product_type: input.productType ?? null,
    confidence: input.confidence ?? null,
    model: DEEPSEEK_MODEL,
    raw_response: input.rawResponse ?? null,
  } as never)
}
