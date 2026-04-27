import { eq, and, sql } from 'drizzle-orm'
import { vote, post } from '#layers/feedlog/server/db/schemas'

// DELETE /api/posts/:id/vote — Remove vote (requires auth, idempotent)
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const postId = getRouterParam(event, 'postId')!

  const db = useDB()

  // Delete vote
  const [deleted] = await db
    .delete(vote)
    .where(and(eq(vote.postId, postId), eq(vote.userId, session.user.id)))
    .returning({ postId: vote.postId })

  if (!deleted) {
    // Not voted, return current state
    const [p] = await db.select({ voteCount: post.voteCount }).from(post).where(eq(post.id, postId))
    return { voted: false, voteCount: p?.voteCount ?? 0 }
  }

  // Decrement count
  const [updated] = await db
    .update(post)
    .set({ voteCount: sql`greatest(${post.voteCount} - 1, 0)` })
    .where(eq(post.id, postId))
    .returning({ voteCount: post.voteCount })

  return { voted: false, voteCount: updated?.voteCount ?? 0 }
})
