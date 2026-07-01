import { cookies } from 'next/headers'
import { isAdmin } from './admin'
import { signCookieValue, verifyCookieValue } from '../security/cookie-signing'

export const IMPERSONATE_COOKIE = 'fm_impersonate'
export const IMPERSONATE_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'strict' as const,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 3600,
  path: '/',
}

const IMPERSONATE_TTL_SECONDS = 3600

async function getSecret(): Promise<string | null> {
  const raw = process.env.CHALLENGE_SECRET
  if (!raw) return null

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(raw),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const digest = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode('impersonation')
  )

  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function signImpersonationValue(slug: string): Promise<string> {
  const secret = await getSecret()
  if (!secret) throw new Error('CHALLENGE_SECRET is required')

  const expiresAt = Math.floor(Date.now() / 1000) + IMPERSONATE_TTL_SECONDS
  return signCookieValue(`${slug}:${expiresAt}`, secret)
}

async function readImpersonationCookie(
  value: string | null | undefined
): Promise<{ slug: string; expiresAt: number } | null> {
  const secret = await getSecret()
  if (!value || !secret) return null

  const verified = await verifyCookieValue(value, secret)
  if (!verified) return null

  const separatorIndex = verified.lastIndexOf(':')
  if (separatorIndex <= 0) return null

  const slug = verified.slice(0, separatorIndex)
  const expiresAt = parseInt(verified.slice(separatorIndex + 1), 10)
  if (Number.isNaN(expiresAt)) return null

  if (Math.floor(Date.now() / 1000) > expiresAt) return null

  return { slug, expiresAt }
}

export async function getImpersonatedBrandSlug(): Promise<string | null> {
  try {
    const c = await cookies()
    const result = await readImpersonationCookie(c.get(IMPERSONATE_COOKIE)?.value)
    return result?.slug ?? null
  } catch {
    return null
  }
}

export async function getImpersonationExpiresAt(): Promise<number | null> {
  try {
    const c = await cookies()
    const result = await readImpersonationCookie(c.get(IMPERSONATE_COOKIE)?.value)
    return result?.expiresAt ?? null
  } catch {
    return null
  }
}

export async function resolveImpersonationCookie({
  email,
  currentCookie,
}: {
  email: string | null
  currentCookie: string | undefined
}): Promise<{ action: 'delete' } | { action: 'none' }> {
  if (!currentCookie) return { action: 'none' }

  if (!email || !isAdmin(email)) return { action: 'delete' }

  const parsed = await readImpersonationCookie(currentCookie)
  if (!parsed) return { action: 'delete' }

  return { action: 'none' }
}
