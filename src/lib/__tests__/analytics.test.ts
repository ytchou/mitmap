// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSendGAEvent = vi.fn()
vi.mock('@next/third-parties/google', () => ({
  sendGAEvent: (...args: unknown[]) => mockSendGAEvent(...args),
}))

import {
  trackOnboardingBannerShown,
  trackOnboardingBannerCtaClick,
  trackOnboardingBannerDismiss,
  trackOnboardingMilestoneReached,
} from '../analytics'

describe('onboarding tracking', () => {
  beforeEach(() => {
    mockSendGAEvent.mockClear()
    window.dataLayer = []
  })

  it('trackOnboardingBannerShown fires with brand slug', () => {
    trackOnboardingBannerShown('test-brand')
    expect(mockSendGAEvent).toHaveBeenCalledWith(
      'event',
      'onboarding_banner_shown',
      { brand_slug: 'test-brand' }
    )
  })

  it('trackOnboardingBannerCtaClick fires with brand slug', () => {
    trackOnboardingBannerCtaClick('test-brand')
    expect(mockSendGAEvent).toHaveBeenCalledWith(
      'event',
      'onboarding_banner_cta_click',
      { brand_slug: 'test-brand' }
    )
  })

  it('trackOnboardingBannerDismiss fires with brand slug', () => {
    trackOnboardingBannerDismiss('test-brand')
    expect(mockSendGAEvent).toHaveBeenCalledWith(
      'event',
      'onboarding_banner_dismiss',
      { brand_slug: 'test-brand' }
    )
  })

  it('trackOnboardingMilestoneReached fires with brand slug and milestone', () => {
    trackOnboardingMilestoneReached('test-brand', 'halfway')
    expect(mockSendGAEvent).toHaveBeenCalledWith(
      'event',
      'onboarding_milestone_reached',
      { brand_slug: 'test-brand', milestone: 'halfway' }
    )
  })
})
