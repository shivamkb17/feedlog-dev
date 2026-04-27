import { eq } from 'drizzle-orm'
import { changelog, changelogReaction } from '#layers/feedlog/server/db/schemas'

// DELETE /api/admin/changelogs/:id — Delete changelog (admin)
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')!
  const db = useDB()

  // Cascade delete reactions (no DB foreign keys)
  await db.delete(changelogReaction).where(eq(changelogReaction.changelogId, id))

  const [deleted] = await db
    .delete(changelog)
    .where(eq(changelog.id, id))
    .returning({ id: changelog.id })

  if (!deleted) {
    throw createError({ statusCode: 404, message: 'Changelog not found' })
  }

  setResponseStatus(event, 204)
  return null
})
