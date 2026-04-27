import type { H3Event } from 'h3'

// `auth` is the better-auth instance, auto-imported from
// server/utils/better-auth.ts by Nitro. No explicit import needed.

// Get current session, returns null if not authenticated
export async function getUserSession(event: H3Event) {
  const session = await auth.api.getSession({
    headers: event.headers,
  })
  return session
}

// Require authentication, throws 401 if not logged in
export async function requireAuth(event: H3Event) {
  const session = await getUserSession(event)
  if (!session) {
    throw createError({ statusCode: 401, message: 'Authentication required' })
  }
  return session
}

// Require admin role, throws 403 if not admin
export async function requireAdmin(event: H3Event) {
  const session = await requireAuth(event)
  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }
  return session
}
