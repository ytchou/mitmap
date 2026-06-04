import { describe, it, expect } from 'vitest'
import { buildReviewUpdate } from './review-status'

describe('buildReviewUpdate', () => {
  it('sets status and an ISO reviewed_at for a "reviewed" decision', () => {
    const update = buildReviewUpdate('reviewed')
    expect(update.status).toBe('reviewed')
    expect(typeof update.reviewed_at).toBe('string')
    // round-trips as a valid ISO 8601 timestamp
    expect(new Date(update.reviewed_at as string).toISOString()).toBe(update.reviewed_at)
  })

  it('sets status and OMITS reviewed_at for a "dismissed" decision', () => {
    const update = buildReviewUpdate('dismissed')
    expect(update).toEqual({ status: 'dismissed' })
    expect('reviewed_at' in update).toBe(false)
  })
})
