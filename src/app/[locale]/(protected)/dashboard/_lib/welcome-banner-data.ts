import type { OwnedBrand } from '@/lib/services/brand-owners'
import {
  buildOnboardingProgress,
  getBrandOnboardingProgress,
  type OnboardingStep,
  type OnboardingStepKey,
} from '@/lib/services/brand-onboarding'

export type WelcomeBannerData = {
  completedCount: number
  isComplete: boolean
  nextStep: OnboardingStepKey | null
  steps: OnboardingStep[]
}

export async function getWelcomeBannerData(
  selectedBrand: OwnedBrand
): Promise<WelcomeBannerData | null> {
  try {
    return await getBrandOnboardingProgress(selectedBrand.brandId)
  } catch {
    return buildOnboardingProgress([])
  }
}
