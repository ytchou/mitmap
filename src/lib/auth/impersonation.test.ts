import { createHmac } from 'node:crypto'
import { afterEach, describe, expect, it } from 'vitest'
import { verifyCookieValue } from '@/lib/security/cookie-signing'
import { signImpersonationValue } from './impersonation'

describe('signImpersonationValue', () => {
  const originalSecret = process.env.CHALLENGE_SECRET

  afterEach(() => {
    if (originalSecret === undefined) delete process.env.CHALLENGE_SECRET
    else process.env.CHALLENGE_SECRET = originalSecret
  })

  it('uses the existing HMAC-derived secret format with Web Crypto', async () => {
    process.env.CHALLENGE_SECRET = 'test-challenge-secret'
    const signed = await signImpersonationValue('sample-brand')
    const derivedSecret = createHmac('sha256', 'test-challenge-secret')
      .update('impersonation')
      .digest('hex')

    const value = await verifyCookieValue(signed, derivedSecret)
    expect(value).toMatch(/^sample-brand:\d+$/)
  })
})
