import { eq } from 'drizzle-orm'
import { post, comment, commentLike, vote } from '#layers/feedlog/server/db/schemas'
import { sql } from 'drizzle-orm'

// DELETE /api/posts/:id — Delete post (admin, hard delete)
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')!
  const db = useDB()

  // Block deletion of merged posts (must unmerge first)
  const [existing] = await db.select({ mergedTo: post.mergedTo }).from(post).where(eq(post.id, id)).limit(1)
  if (existing?.mergedTo) {
    throw createError({ statusCode: 400, message: 'Cannot delete a merged post. Unmerge it first.' })
  }

  // Delete associated data (no DB foreign keys, cascade at application level)
  // 1. Delete all comment likes for this post
  await db.delete(commentLike).where(
    sql`${commentLike.commentId} IN (SELECT ${comment.id} FROM ${comment} WHERE ${comment.postId} = ${id})`,
  )
  // 2. Delete all comments for this post
  await db.delete(comment).where(eq(comment.postId, id))
  // 3. Delete votes for this post
  await db.delete(vote).where(eq(vote.postId, id))
  // 4. Delete the post itself
  const [deleted] = await db.delete(post).where(eq(post.id, id)).returning({ id: post.id })

  if (!deleted) {
    throw createError({ statusCode: 404, message: 'Post not found' })
  }

  setResponseStatus(event, 204)
  return null
})
