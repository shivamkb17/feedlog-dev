import { sql } from 'drizzle-orm'
import { board } from '#layers/feedlog/server/db/schemas'
import { createBoardSchema } from '#layers/feedlog/shared/schemas/board'

// POST /api/boards — Create board (admin)
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readValidatedBody(event, createBoardSchema.parse)

  const db = useDB()
  const [maxRow] = await db
    .select({ max: sql<number>`coalesce(max(${board.position}), -1)` })
    .from(board)

  const [created] = await db
    .insert(board)
    .values({
      name: body.name,
      description: body.description || null,
      position: (maxRow?.max ?? -1) + 1,
    })
    .returning()

  setResponseStatus(event, 201)
  return created
})
