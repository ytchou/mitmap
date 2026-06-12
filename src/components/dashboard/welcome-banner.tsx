'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  trackOnboardingBannerCtaClick,
  trackOnboardingBannerDismiss,
  trackOnboardingBannerShown,
} from '@/lib/analytics'

type WelcomeBannerProps = {
  claimedAt: string | null
  completionFraction: number
  slug: string
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

export function WelcomeBanner({
  claimedAt,
  completionFraction,
  slug,
}: WelcomeBannerProps) {
  const t = useTranslations('dashboard.onboarding.banner')
  const [dismissed, setDismissed] = useState(false)
  const [mountedAt] = useState(() => Date.now())
  const claimedAtTime = claimedAt === null ? null : new Date(claimedAt).getTime()
  const isWithinClaimWindow =
    claimedAtTime !== null && mountedAt - claimedAtTime <= SEVEN_DAYS_MS
  const shouldShow =
    claimedAt !== null && isWithinClaimWindow && completionFraction < 1
  const shouldTrackShownRef = useRef(shouldShow)

  useEffect(() => {
    if (shouldTrackShownRef.current) {
      trackOnboardingBannerShown(slug)
    }
  }, [slug])

  if (!shouldShow || dismissed) {
    return null
  }

  const actions = [
    { label: t('action1'), hint: t('action1Hint') },
    { label: t('action2'), hint: t('action2Hint') },
    { label: t('action3'), hint: t('action3Hint') },
  ]

  return (
    <section className="rounded-xl border border-[#E5E0D8] border-l-4 border-l-[#2F5D50] bg-white p-6">
      <div className="space-y-1">
        <h2 className="text-base font-bold text-[#1C1C1C]">{t('title')}</h2>
        <p className="mt-1 text-sm text-[#4A4A4A]">{t('description')}</p>
      </div>

      <ol className="mt-5 space-y-4">
        {actions.map((action, index) => (
          <li key={action.label} className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F5F4F1] text-xs font-semibold text-[#2F5D50]">
              {index + 1}
            </span>
            <div className="space-y-1">
              <p className="text-sm font-medium text-[#1C1C1C]">{action.label}</p>
              <p className="text-xs text-[#6B6B6B]">{action.hint}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <a
          className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-[#C4693B] px-6 py-3 text-sm font-medium text-white hover:bg-[#B05830] focus:outline-none focus:ring-2 focus:ring-[#2F5D50]"
          href={`/dashboard/brands/${slug}/edit#media`}
          onClick={() => trackOnboardingBannerCtaClick(slug)}
        >
          {t('cta')}
        </a>
        <button
          className="min-h-[48px] text-sm text-[#6B6B6B] underline hover:text-[#1C1C1C] focus:outline-none focus:ring-2 focus:ring-[#2F5D50]"
          type="button"
          onClick={() => {
            trackOnboardingBannerDismiss(slug)
            setDismissed(true)
          }}
        >
          {t('dismiss')}
        </button>
      </div>
    </section>
  )
}
