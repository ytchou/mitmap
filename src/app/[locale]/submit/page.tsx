import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { buildAlternates } from '@/lib/seo/alternates'
import type { Locale } from '@/lib/seo/alternates'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { getTags } from '@/lib/services/taxonomy'
import { SubmitWizard } from '@/components/submit/SubmitWizard'
import SubmitOverview from '@/components/submit/SubmitOverview'

type SubmitPageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: SubmitPageProps): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('submit.metadata')
  return {
    title: t('title'),
    description: t('description'),
    alternates: buildAlternates('/submit', locale as Locale),
  }
}

export default async function SubmitPage({ params }: SubmitPageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    // DEV-762 TEMP INSTRUMENTATION: /submit renders the anonymous overview for a
    // valid user session under CI parallel load while every dashboard route honors
    // the same cookies. Capture WHY getUser() reads null. No token/JWT values are
    // logged — only error metadata, cookie NAMES, and a boolean local-session flag.
    // Remove once the root cause is confirmed.
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const sbCookieNames = (await cookies())
        .getAll()
        .filter((c) => c.name.startsWith('sb-'))
        .map((c) => c.name)
      console.error('[DEV-762] submit getUser null', {
        errMessage: error?.message ?? null,
        errStatus: error?.status ?? null,
        errCode: error?.code ?? null,
        errName: error?.name ?? null,
        hasLocalSession: Boolean(session),
        sbCookieNames,
      })
    } catch (e) {
      console.error('[DEV-762] submit instrumentation failed', (e as Error).message)
    }
    return <SubmitOverview nextPath={locale === 'en' ? '/en/submit' : '/submit'} />
  }

  const categories = await getTags('product_type')

  return <SubmitWizard categories={categories} />
}
