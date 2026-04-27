import { eq } from 'drizzle-orm'
import { z } from 'zod/v4'
import { comment } from '#layers/feedlog/server/db/schemas'

const updateCommentSchema = z.object({
  content: z.string().trim().min(1, 'Content is required').max(5000, 'Comment must be 5000 characters or less'),
})

// PATCH /api/comments/:id — Edit comment (author only)
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const id = getRouterParam(event, 'id')!

  const db = useDB()

  const [existing] = await db
    .select({ id: comment.id, authorId: comment.authorId })
    .from(comment)
    .where(eq(comment.id, id))
    .limit(1)

  if (!existing) {
    throw createError({ statusCode: 404, message: 'Comment not found' })
  }
  if (existing.authorId !== session.user.id) {
    throw createError({ statusCode: 403, message: 'You can only edit your own comments' })
  }

  const body = await readValidatedBody(event, updateCommentSchema.parse)

  const [updated] = await db
    .update(comment)
    .set({ content: body.content, editedAt: new Date() })
    .where(eq(comment.id, id))
    .returning()

  return updated
})
