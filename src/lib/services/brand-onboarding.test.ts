import { describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  eq: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: () => ({
    from: () => ({
      select: () => ({ eq: mocks.eq }),
    }),
  }),
}))

import {
  buildOnboardingProgress,
  getBrandOnboardingProgress,
  ONBOARDING_STEPS,
} from './brand-onboarding'

describe('buildOnboardingProgress', () => {
  it('starts every step incomplete when no progress exists', () => {
    const progress = buildOnboardingProgress([])

    expect(progress.completedCount).toBe(0)
    expect(progress.nextStep).toBe('basics')
    expect(progress.steps.map((step) => step.key)).toEqual(ONBOARDING_STEPS)
    expect(progress.steps.every((step) => step.status === 'not_started')).toBe(true)
  })

  it('preserves explicit progress without inferring from brand fields', () => {
    const progress = buildOnboardingProgress([
      { step_key: 'basics', status: 'complete' },
      { step_key: 'products', status: 'in_progress' },
    ])

    expect(progress.completedCount).toBe(1)
    expect(progress.nextStep).toBe('products')
    expect(progress.isComplete).toBe(false)
  })

  it('shows step one when the onboarding migration has not been applied yet', async () => {
    mocks.eq.mockResolvedValueOnce({
      data: null,
      error: { code: 'PGRST205' },
    })

    const progress = await getBrandOnboardingProgress('brand-1')

    expect(progress.nextStep).toBe('basics')
    expect(progress.completedCount).toBe(0)
  })
})
