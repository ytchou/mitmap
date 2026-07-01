'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { canManageDashboardBrand } from '@/lib/auth/admin-mode'
import { createClient } from '@/lib/supabase/server'
import { getBrandBySlug } from '@/lib/services/brands'
import {
  getBrandOnboardingProgress,
  isOnboardingStepKey,
  setBrandOnboardingStepStatus,
} from '@/lib/services/brand-onboarding'

const STEP_ANCHORS = {
  basics: '#basic-info',
  products: '#product-tags',
  story_media: '#description',
  purchase: '#purchase',
  social_proof: '#social-proof',
} as const

async function requireDashboardAccess(brandSlug: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/sign-in')

  const brand = await getBrandBySlug(brandSlug)
  if (!(await canManageDashboardBrand(user.id, user.email, brand.id, brand.slug))) {
    redirect('/dashboard')
  }

  return { brand, user }
}

export async function startOnboardingStepAction(
  brandSlug: string,
  rawStep: string,
  _formData: FormData
) {
  void _formData
  if (!isOnboardingStepKey(rawStep)) redirect(`/dashboard/onboarding?brand=${brandSlug}`)
  const { brand, user } = await requireDashboardAccess(brandSlug)

  const progress = await getBrandOnboardingProgress(brand.id)
  if (progress.steps.find((step) => step.key === rawStep)?.status !== 'complete') {
    await setBrandOnboardingStepStatus({
      brandId: brand.id,
      userId: user.id,
      step: rawStep,
      status: 'in_progress',
    })
  }
  revalidatePath('/dashboard')
  redirect(
    `/dashboard/brands/${brandSlug}/edit?onboardingStep=${rawStep}${STEP_ANCHORS[rawStep]}`
  )
}

export async function completeOnboardingStepAction(
  brandSlug: string,
  rawStep: string,
  _formData?: FormData
) {
  void _formData
  if (!isOnboardingStepKey(rawStep)) redirect(`/dashboard/onboarding?brand=${brandSlug}`)
  const { brand, user } = await requireDashboardAccess(brandSlug)

  await setBrandOnboardingStepStatus({
    brandId: brand.id,
    userId: user.id,
    step: rawStep,
    status: 'complete',
  })
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/onboarding')
  redirect(`/dashboard/onboarding?brand=${brandSlug}`)
}
