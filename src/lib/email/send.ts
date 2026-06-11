import { createResendProvider } from './resend-adapter'
import type { EmailMessage } from './types'

export function sendEmail(message: EmailMessage): void {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('[email] RESEND_API_KEY not configured, skipping email')
    return
  }

  const provider = createResendProvider(apiKey)
  provider.send(message).catch((err) => {
    console.error('[email]', err)
  })
}
