'use client'

import { Heart } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import type { MouseEvent } from 'react'

import { useSavedBrands } from '@/hooks/use-saved-brands'
import { useUser } from '@/lib/auth/use-user'
import { cn } from '@/lib/utils'

type SaveBrandButtonProps = {
  brandId: string
  variant?: 'overlay' | 'inline'
}

export function SaveBrandButton({
  brandId,
  variant = 'overlay',
}: SaveBrandButtonProps) {
  const t = useTranslations('saveBrand')
  const router = useRouter()
  const { user, loading: userLoading } = useUser()
  const { savedIds, toggle, loading: savedBrandsLoading } = useSavedBrands()
  const isSaved = savedIds.has(brandId)
  const isLoading = userLoading || savedBrandsLoading
  const label = isSaved ? t('unsave') : t('save')

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()

    if (isLoading) {
      return
    }

    if (!user) {
      router.push('/auth/login')
      return
    }

    toggle(brandId)
  }

  return (
    <button
      type="button"
      aria-label={isSaved ? t('unsaveAriaLabel') : t('saveAriaLabel')}
      title={!user ? t('loginToSave') : label}
      disabled={isLoading}
      className={cn(
        'inline-flex shrink-0 items-center justify-center border border-border bg-white text-[#2F5D50] transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'overlay'
          ? 'absolute right-2 top-2 h-10 w-10 rounded-full shadow-md'
          : 'gap-2 rounded-md px-3 py-2 text-sm font-medium'
      )}
      onClick={handleClick}
    >
      <Heart
        className="h-5 w-5"
        fill={isSaved ? '#2F5D50' : 'none'}
        strokeWidth={2}
        aria-hidden
      />
      {variant === 'inline' && <span>{label}</span>}
    </button>
  )
}
