// `blobStorage` auto-imported from server/utils/blob.ts.

// POST /api/upload — Upload a file (requires authentication)
export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const [file] = await blobStorage.handleUpload(event, {
    formKey: 'file',
    multiple: false,
    ensure: {
      maxSize: '10MB',
      types: ['image'],
    },
    put: {
      addRandomSuffix: true,
      prefix: `${useRuntimeConfig().public.uploadPrefix}/`,
    },
  })

  if (!file) {
    throw createError({ statusCode: 400, message: 'No file provided' })
  }

  return { key: file.pathname }
})
