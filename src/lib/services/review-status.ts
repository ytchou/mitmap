export type ReviewStatus = 'pending' | 'reviewed' | 'dismissed'

export type ReviewDecision = 'reviewed' | 'dismissed'

export function buildReviewUpdate(decision: ReviewDecision): Record<string, unknown> {
  const update: Record<string, unknown> = { status: decision }

  if (decision === 'reviewed') {
    update.reviewed_at = new Date().toISOString()
  }

  return update
}
