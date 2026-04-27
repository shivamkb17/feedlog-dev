import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin } from 'better-auth/plugins'
import { db } from '../db'
import { hashPassword, verifyPassword } from './password-hash'

const env = process.env

const systemAdminEmails = env.SYSTEM_ADMIN_EMAILS?.split(',').map(s => s.trim()).filter(Boolean) ?? []

const hasGoogle = !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET)
const hasGithub = !!(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET)
const hasOAuth  = hasGoogle || hasGithub
// "Real" email delivery. A `console` provider is always registered, but that
// only logs to the server — useless for verification/reset flows to end users.
// Resend API key is the only currently supported real transport.
const hasEmailProvider = !!env.RESEND_API_KEY

function parseBool(v: string | undefined): boolean | undefined {
  if (v === undefined) return undefined
  return ['1', 'true', 'yes', 'on'].includes(v.toLowerCase())
}

// Email login: explicit env takes priority, otherwise on iff no OAuth configured
// (so an install with zero OAuth creds is never locked out).
const emailLoginEnabled = parseBool(env.AUTH_EMAIL_ENABLED) ?? !hasOAuth

// Email verification: explicit env takes priority, otherwise on iff email provider
// is configured (off-by-default prevents "signup fails because SMTP unset" trap).
const requireEmailVerification = parseBool(env.AUTH_EMAIL_VERIFY) ?? hasEmailProvider

if (!hasOAuth && !emailLoginEnabled) {
  throw new Error(
    '[auth] No sign-in method configured. Enable OAuth (GOOGLE_CLIENT_ID / GITHUB_CLIENT_ID) or set AUTH_EMAIL_ENABLED=true.',
  )
}

const socialProviders: Record<string, { clientId: string; clientSecret: string }> = {}
if (hasGoogle) {
  socialProviders.google = {
    clientId: env.GOOGLE_CLIENT_ID!,
    clientSecret: env.GOOGLE_CLIENT_SECRET!,
  }
}
if (hasGithub) {
  socialProviders.github = {
    clientId: env.GITHUB_CLIENT_ID!,
    clientSecret: env.GITHUB_CLIENT_SECRET!,
  }
}

const emailAndPassword = emailLoginEnabled
  ? {
    enabled: true,
    requireEmailVerification,
    password: { hash: hashPassword, verify: verifyPassword },
    ...(hasEmailProvider && {
      sendResetPassword: async ({ user, url }: { user: { email: string; name: string }; url: string }) => {
        await sendEmail({
          to: user.email,
          subject: 'Reset your FeedLog password',
          html: renderResetPasswordEmail({ url, name: user.name }),
        })
      },
    }),
  }
  : { enabled: false }

const emailVerification = hasEmailProvider
  ? {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 3600,
    sendVerificationEmail: async ({ user, url }: { user: { email: string; name: string }; url: string }) => {
      await sendEmail({
        to: user.email,
        subject: 'Confirm your email to start using FeedLog',
        html: renderVerificationEmail({ url, name: user.name }),
      })
    },
  }
  : undefined

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword,
  ...(emailVerification && { emailVerification }),
  socialProviders,
  plugins: [
    admin(),
  ],
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (systemAdminEmails.includes(user.email)) {
            return {
              data: {
                ...user,
                role: 'admin',
              },
            }
          }
          return { data: user }
        },
      },
    },
  },
})

export const authConfig = {
  google: hasGoogle,
  github: hasGithub,
  email: emailLoginEnabled,
  emailVerification: !!emailVerification,
}
