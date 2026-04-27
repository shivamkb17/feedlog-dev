import { changelog } from '#layers/feedlog/server/db/schemas'
import { createChangelogSchema } from '#layers/feedlog/shared/schemas/changelog'

// POST /api/admin/changelogs — Create changelog (admin)
export default defineEventHandler(async (event) => {
  const session = await requireAdmin(event)
  const body = await readValidatedBody(event, createChangelogSchema.parse)

  const db = useDB()
  const slug = await generateChangelogSlug(body.title)

  const [created] = await db
    .insert(changelog)
    .values({
      authorId: session.user.id,
      slug,
      title: body.title,
      content: body.content,
      categories: body.categories,
      cover: body.cover ?? null,
    })
    .returning()

  setResponseStatus(event, 201)
  return created
})
