import { eq, and, sql } from 'drizzle-orm'
import { vote, post } from '#layers/feedlog/server/db/schemas'

// POST /api/posts/:id/vote — Vote on a post (requires auth, idempotent)
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const postId = getRouterParam(event, 'postId')!

  const db = useDB()

  // Block voting on merged posts
  const [p] = await db.select({ mergedTo: post.mergedTo }).from(post).where(eq(post.id, postId)).limit(1)
  if (p?.mergedTo) {
    throw createError({ statusCode: 403, message: 'Cannot vote on a merged post' })
  }

  // Check if already voted
  const [existing] = await db
    .select({ postId: vote.postId })
    .from(vote)
    .where(and(eq(vote.postId, postId), eq(vote.userId, session.user.id)))
    .limit(1)

  if (existing) {
    // Already voted, return current state
    const [p] = await db.select({ voteCount: post.voteCount }).from(post).where(eq(post.id, postId))
    return { voted: true, voteCount: p?.voteCount ?? 0 }
  }

  // Insert vote + increment count in transaction
  await db.insert(vote).values({ postId, userId: session.user.id })
  const [updated] = await db
    .update(post)
    .set({ voteCount: sql`${post.voteCount} + 1` })
    .where(eq(post.id, postId))
    .returning({ voteCount: post.voteCount })

  return { voted: true, voteCount: updated?.voteCount ?? 0 }
})
