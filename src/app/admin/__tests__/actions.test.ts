import { describe, it, expect, afterEach } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import { rejectSubmission } from '@/lib/services/submissions'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
}

const supabase = createClient<Database>(supabaseUrl, serviceRoleKey)

describe('admin submission rejection', () => {
  const testBrandName = '[TEST-REJECT] Submission First Brand'
  const reviewerId = '00000000-0000-4000-8000-000000000001'

  afterEach(async () => {
    await supabase.from('brand_submissions').delete().eq('brand_name', testBrandName)
    await supabase.from('brands').delete().eq('name', testBrandName)
  })

  it('rejects a submission without touching the brands table', async () => {
    const reviewerNotes = 'Not enough product details yet'

    const { data: inserted, error: insertError } = await supabase
      .from('brand_submissions')
      .insert({
        brand_id: null,
        brand_name: testBrandName,
        submitter_email: 'reject-submission@example.com',
        status: 'pending',
      })
      .select('id')
      .single()

    expect(insertError).toBeNull()
    expect(inserted).not.toBeNull()

    await rejectSubmission(inserted!.id, reviewerId, reviewerNotes)

    const { data: submission, error: submissionError } = await supabase
      .from('brand_submissions')
      .select('status, reviewer_notes, reviewed_at, reviewed_by, brand_id')
      .eq('id', inserted!.id)
      .single()

    expect(submissionError).toBeNull()
    expect(submission).not.toBeNull()
    expect(submission!.status).toBe('rejected')
    expect(submission!.reviewer_notes).toBe(reviewerNotes)
    expect(submission!.reviewed_at).toEqual(expect.any(String))
    expect(submission!.reviewed_by).toBe(reviewerId)
    expect(submission!.brand_id).toBeNull()

    const { data: brands, error: brandsError } = await supabase
      .from('brands')
      .select('id')
      .eq('name', testBrandName)

    expect(brandsError).toBeNull()
    expect(brands).toHaveLength(0)
  })
})
