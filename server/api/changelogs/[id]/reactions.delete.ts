import { eq, and, sql, isNotNull } from 'drizzle-orm'
import { changelog, changelogReaction } from '#layers/feedlog/server/db/schemas'

// DELETE /api/changelogs/:id/reactions?emoji=👍 — Remove reaction (requires auth, idempotent)
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const id = getRouterParam(event, 'id')!
  const query = getQuery(event)
  const emoji = query.emoji as string

  // Validate emoji
  if (!emoji || !(CHANGELOG_EMOJIS as readonly string[]).includes(emoji)) {
    throw createError({ statusCode: 400, message: 'Invalid emoji' })
  }

  const db = useDB()

  // Verify changelog exists and is published
  const [entry] = await db
    .select({ id: changelog.id })
    .from(changelog)
    .where(and(eq(changelog.id, id), isNotNull(changelog.publishedAt)))
    .limit(1)

  if (!entry) {
    throw createError({ statusCode: 404, message: 'Changelog not found' })
  }

  // Idempotent delete
  await db
    .delete(changelogReaction)
    .where(and(
      eq(changelogReaction.changelogId, id),
      eq(changelogReaction.userId, session.user.id),
      eq(changelogReaction.emoji, emoji),
    ))

  // Return current state
  const reactionRows = await db
    .select({
      emoji: changelogReaction.emoji,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(changelogReaction)
    .where(eq(changelogReaction.changelogId, id))
    .groupBy(changelogReaction.emoji)

  const reactionCounts: Record<string, number> = {}
  for (const r of reactionRows) {
    reactionCounts[r.emoji] = r.count
  }

  const userRows = await db
    .select({ emoji: changelogReaction.emoji })
    .from(changelogReaction)
    .where(and(
      eq(changelogReaction.changelogId, id),
      eq(changelogReaction.userId, session.user.id),
    ))

  return {
    reacted: false,
    reactionCounts,
    userReactions: userRows.map(r => r.emoji),
  }
})
