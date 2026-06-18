import {
  buildMicrositeSpotlightEmail,
  buildProfileNudgeEmail,
  buildReEngagementEmail,
  buildWelcomeEmail,
} from '@/lib/email/templates'
import { sendEmail } from '@/lib/email/send'
import * as supabaseServer from '@/lib/supabase/server'
import type { EmailMessage } from '@/lib/email/types'

declare module '@/lib/supabase/server' {
  export function createAdminClient(): unknown
}

type DripKey = 'welcome' | 'profile_nudge' | 'microsite_spotlight' | 're_engagement'

type OwnerRow = {
  user_id: string
  email: string
  brand_name: string
  brand_slug: string
  unsubscribe_token: string
  site_content?: Record<string, unknown>
}

type QueryResult<T> = {
  data: T[] | null
  error: QueryError | null
}

type QueryError = {
  message?: string
}

type QueryBuilder<T> = PromiseLike<QueryResult<T>> & {
  eq?: (column: string, value: string) => QueryBuilder<T>
  is?: (column: string, value: null) => QueryBuilder<T>
  lt?: (column: string, value: string) => QueryBuilder<T>
  not?: (column: string, operator: string, value: unknown) => QueryBuilder<T>
}

type SupabaseTable<T> = {
  select: (columns: string) => QueryBuilder<T>
  insert?: (values: Record<string, unknown>) => PromiseLike<{ error: QueryError | null }>
}

type SupabaseClientLike = {
  from: <T>(table: string) => SupabaseTable<T>
}

type DripBuilderProps = {
  to: string
  brandName: string
  brandSlug: string
  unsubscribeToken: string
  completenessPercent: number
  missingFields: string[]
}

type DripType = {
  key: DripKey
  daysSinceClaim: number
  builder: (props: DripBuilderProps) => Promise<EmailMessage>
}

export const DRIP_TYPES: DripType[] = [
  { key: 'welcome', daysSinceClaim: 1, builder: buildWelcomeEmail },
  { key: 'profile_nudge', daysSinceClaim: 3, builder: buildProfileNudgeEmail },
  { key: 'microsite_spotlight', daysSinceClaim: 1, builder: buildMicrositeSpotlightEmail },
  { key: 're_engagement', daysSinceClaim: 14, builder: buildReEngagementEmail },
]

export async function evaluateDrips(
  dripType: string
): Promise<{ sent: number; skipped: number; errors: number }> {
  const drip = DRIP_TYPES.find((type) => type.key === dripType)
  if (!drip) {
    throw new Error(`Unknown drip type: ${dripType}`)
  }

  const supabase = getAdminClient()
  const { data, error } = await queryEligibleOwners(supabase, drip)

  if (error) {
    console.error('Failed to query drip owners', { dripType, error })
    return { sent: 0, skipped: 0, errors: 1 }
  }

  const ownerRows = data ?? []
  if (ownerRows.length === 0) {
    return { sent: 0, skipped: 0, errors: 0 }
  }

  const sentQuery = supabase
    .from<{ user_id: string }>('email_sends')
    .select('user_id')
  const { data: sentRows, error: sentError } = sentQuery.eq
    ? await sentQuery.eq('template_key', drip.key)
    : { data: null, error: { message: 'Supabase query builder is missing eq()' } }

  if (sentError) {
    console.error('Failed to query prior email sends', { dripType, error: sentError })
    return { sent: 0, skipped: 0, errors: 1 }
  }

  const preferencesQuery = supabase
    .from<{ user_id: string }>('owner_email_preferences')
    .select('user_id')
  const { data: unsubscribedRows, error: preferencesError } = preferencesQuery.not
    ? await preferencesQuery.not('unsubscribed_at', 'is', null)
    : { data: null, error: { message: 'Supabase query builder is missing not()' } }

  if (preferencesError) {
    console.error('Failed to query owner email preferences', { dripType, error: preferencesError })
    return { sent: 0, skipped: 0, errors: 1 }
  }

  const alreadySentUserIds = new Set((sentRows ?? []).map((row: { user_id: string }) => row.user_id))
  const unsubscribedUserIds = new Set(
    (unsubscribedRows ?? []).map((row: { user_id: string }) => row.user_id)
  )
  const owners = ownerRows.map(normalizeOwnerRow)
  let sent = 0
  let skipped = 0
  let errors = 0

  for (const owner of owners) {
    if (alreadySentUserIds.has(owner.user_id) || unsubscribedUserIds.has(owner.user_id)) {
      skipped++
      continue
    }

    try {
      const message = await drip.builder({
        to: owner.email,
        brandName: owner.brand_name,
        brandSlug: owner.brand_slug,
        unsubscribeToken: owner.unsubscribe_token,
        ...profileCompleteness(owner),
      })

      await sendEmail(message)

      const insertResult = await supabase.from('email_sends').insert?.({
        user_id: owner.user_id,
        template_key: drip.key,
      })

      if (insertResult?.error) {
        throw new Error(insertResult.error.message ?? 'Failed to record email send')
      }

      sent++
    } catch (err) {
      console.error('Failed to send drip email', { dripType, userId: owner.user_id, error: err })
      errors++
    }
  }

  return { sent, skipped, errors }
}

function getAdminClient(): SupabaseClientLike {
  const serverModule = supabaseServer as typeof supabaseServer & {
    createAdminClient?: () => unknown
  }
  const client = serverModule.createAdminClient?.() ?? serverModule.createServiceClient()
  return client as SupabaseClientLike
}

function queryEligibleOwners(
  supabase: SupabaseClientLike,
  drip: DripType
): PromiseLike<QueryResult<Record<string, unknown>>> {
  let query = supabase
    .from<Record<string, unknown>>('brand_owners')
    .select(`
      user_id,
      claimed_at,
      brands!inner(name, slug, site_content),
      owner_email_preferences!inner(unsubscribe_token),
      email:users!brand_owners_user_id_fkey(email)
    `)

  if (query.lt) {
    query = query.lt('claimed_at', daysAgo(drip.daysSinceClaim))
    if (drip.key === 'microsite_spotlight' && query.eq) {
      query = query.eq('brands.site_content->>enabled', 'true')
    }
    return query
  }

  if (query.eq && query.is) {
    const afterEq = query.eq('drip_type', drip.key)
    const afterIs = afterEq.is?.('unsubscribed_at', null) ?? afterEq
    const afterLt = afterIs.lt?.('claimed_at', daysAgo(drip.daysSinceClaim)) ?? afterIs
    return afterLt.not?.('user_id', 'is', null) ?? afterLt
  }

  return query
}

function daysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

function normalizeOwnerRow(row: Record<string, unknown>): OwnerRow {
  const brand = objectValue(Array.isArray(row.brands) ? row.brands[0] : row.brands)
  const preferences = Array.isArray(row.owner_email_preferences)
    ? row.owner_email_preferences[0]
    : row.owner_email_preferences
  const preference = objectValue(preferences)
  const user = objectValue(Array.isArray(row.email) ? row.email[0] : row.email)
  const email = typeof row.email === 'string' ? row.email : stringValue(user?.email)

  return {
    user_id: stringValue(row.user_id),
    email,
    brand_name: stringValue(row.brand_name ?? brand?.name),
    brand_slug: stringValue(row.brand_slug ?? brand?.slug),
    unsubscribe_token: stringValue(row.unsubscribe_token ?? preference?.unsubscribe_token),
    site_content: objectValue(brand?.site_content),
  }
}

function profileCompleteness(owner: OwnerRow): {
  completenessPercent: number
  missingFields: string[]
} {
  const fields = ['description', 'logo', 'social_links', 'founding_year', 'website_url']
  const missingFields = fields.filter((field) => !owner.site_content?.[field])
  const completenessPercent = Math.round(((fields.length - missingFields.length) / fields.length) * 100)

  return { completenessPercent, missingFields }
}

function objectValue(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' ? value as Record<string, unknown> : undefined
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : ''
}
