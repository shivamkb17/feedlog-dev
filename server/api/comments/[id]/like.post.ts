import { eq, and, sql } from 'drizzle-orm'
import { commentLike, comment } from '#layers/feedlog/server/db/schemas'

// POST /api/comments/:id/like — Like a comment (requires auth, idempotent)
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const commentId = getRouterParam(event, 'id')!

  const db = useDB()

  // Check if already liked
  const [existing] = await db
    .select({ commentId: commentLike.commentId })
    .from(commentLike)
    .where(and(eq(commentLike.commentId, commentId), eq(commentLike.userId, session.user.id)))
    .limit(1)

  if (existing) {
    const [c] = await db.select({ likeCount: comment.likeCount }).from(comment).where(eq(comment.id, commentId))
    return { liked: true, likeCount: c?.likeCount ?? 0 }
  }

  await db.insert(commentLike).values({ commentId, userId: session.user.id })
  const [updated] = await db
    .update(comment)
    .set({ likeCount: sql`${comment.likeCount} + 1` })
    .where(eq(comment.id, commentId))
    .returning({ likeCount: comment.likeCount })

  return { liked: true, likeCount: updated?.likeCount ?? 0 }
})
