import { eq } from 'drizzle-orm'
import { changelog } from '#layers/feedlog/server/db/schemas'

// GET /api/admin/changelogs/:id — Admin changelog edit detail
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')!
  const db = useDB()

  const [entry] = await db
    .select({
      id: changelog.id,
      slug: changelog.slug,
      status: changelog.status,
      title: changelog.title,
      content: changelog.content,
      categories: changelog.categories,
      cover: changelog.cover,
      publishedAt: changelog.publishedAt,
      createdAt: changelog.createdAt,
      updatedAt: changelog.updatedAt,
    })
    .from(changelog)
    .where(eq(changelog.id, id))
    .limit(1)

  if (!entry) {
    throw createError({ statusCode: 404, message: 'Changelog not found' })
  }

  return entry
})
