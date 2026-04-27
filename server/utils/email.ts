// Email sending abstraction — Registry pattern
// Auto-imported by Nitro, available in all server/ code

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export interface EmailProvider {
  name: string
  send(options: SendEmailOptions): Promise<void>
}

// --- Registry ---
const providers = new Map<string, EmailProvider>()

export function registerEmailProvider(provider: EmailProvider) {
  providers.set(provider.name, provider)
}

export function resolveEmailProvider(): EmailProvider {
  const preferred = process.env.EMAIL_PROVIDER

  // 1. Explicitly specified provider
  if (preferred && providers.has(preferred))
    return providers.get(preferred)!

  // 2. Fallback by priority
  for (const name of ['resend', 'console']) {
    if (providers.has(name)) return providers.get(name)!
  }

  throw new Error('No email provider registered')
}

export async function sendEmail(options: SendEmailOptions) {
  await resolveEmailProvider().send(options)
}
