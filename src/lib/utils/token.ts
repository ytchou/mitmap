import { createHash, randomBytes } from 'node:crypto'

const VERIFICATION_TOKEN_EXPIRES_IN_MS = 7 * 24 * 60 * 60 * 1000

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function generateVerificationToken(): {
  token: string
  tokenHash: string
  expiresAt: string
} {
  const token = randomBytes(32).toString('base64url')
  return {
    token,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_EXPIRES_IN_MS).toISOString(),
  }
}
