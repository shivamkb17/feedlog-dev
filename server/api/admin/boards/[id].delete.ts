import { eq } from 'drizzle-orm'
import { board, post } from '#layers/feedlog/server/db/schemas'

// DELETE /api/boards/:id — Delete board (admin), sets post board_id to null
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')!
  const db = useDB()

  // Clear board_id on associated posts
  await db.update(post).set({ boardId: null }).where(eq(post.boardId, id))

  const [deleted] = await db.delete(board).where(eq(board.id, id)).returning({ id: board.id })

  if (!deleted) {
    throw createError({ statusCode: 404, message: 'Board not found' })
  }

  setResponseStatus(event, 204)
  return null
})
