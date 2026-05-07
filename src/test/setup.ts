import '@testing-library/jest-dom/vitest'
import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client using the service role key for integration tests.
 * Bypasses RLS so tests can read/write all tables.
 */
export function createTestClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for test client'
    )
  }

  return createClient(url, key)
}

/**
 * Wrapper that skips test suites requiring a live Supabase connection
 * when environment variables are not configured.
 *
 * Usage: import { describeWithDb } from '@/test/setup'
 * then use describeWithDb('suite name', () => { ... })
 */
export function describeWithDb(
  name: string,
  fn: () => void
): ReturnType<typeof import('vitest')['describe']> {
  const { describe } = require('vitest') as typeof import('vitest')
  const hasEnv =
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  return hasEnv ? describe(name, fn) : describe.skip(name, fn)
}
