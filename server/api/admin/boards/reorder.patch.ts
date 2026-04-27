import { eq } from 'drizzle-orm'
import { board } from '#layers/feedlog/server/db/schemas'
import { reorderBoardSchema } from '#layers/feedlog/shared/schemas/board'

// PATCH /api/boards/reorder — Reorder boards (admin)
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readValidatedBody(event, reorderBoardSchema.parse)

  const db = useDB()
  await Promise.all(
    body.ids.map((id, index) =>
      db.update(board).set({ position: index }).where(eq(board.id, id)),
    ),
  )

  setResponseStatus(event, 204)
  return null
})
