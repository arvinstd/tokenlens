import { serverSupabaseClient } from '#supabase/server'
import { getFile } from '~/server/utils/figma-client'
import { requireUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)

  const body = await readBody<{ pat: string; fileKey: string }>(event)

  if (!body.pat || !body.fileKey) {
    throw createError({ statusCode: 400, message: 'Missing pat or fileKey' })
  }

  // Validate PAT + file access by fetching file metadata
  let fileData: Awaited<ReturnType<typeof getFile>>
  try {
    fileData = await getFile(body.pat, body.fileKey)
  } catch (error: any) {
    if (error?.status === 403 || error?.statusCode === 403) {
      throw createError({ statusCode: 403, message: 'Invalid Figma token or no access to this file' })
    }
    if (error?.status === 404 || error?.statusCode === 404) {
      throw createError({ statusCode: 404, message: 'Figma file not found' })
    }
    throw createError({ statusCode: 500, message: 'Failed to connect to Figma' })
  }

  // Upsert connection in Supabase
  const supabase = await serverSupabaseClient(event)
  const { error: dbError } = await supabase
    .from('figma_connections')
    .upsert({
      user_id: user.id,
      figma_pat: body.pat,
      file_key: body.fileKey,
      file_name: fileData.name,
    }, { onConflict: 'user_id' })

  if (dbError) {
    console.error('[figma/connect] DB error:', dbError.message)
    throw createError({ statusCode: 500, message: 'Failed to save connection' })
  }

  return {
    connected: true,
    fileName: fileData.name,
    fileKey: body.fileKey,
  }
})
