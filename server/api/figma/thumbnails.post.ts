import { serverSupabaseClient } from '#supabase/server'
import { getImages } from '~/server/utils/figma-client'
import { requireUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const supabase = await serverSupabaseClient(event)

  const body = await readBody(event)
  const nodeIds: string[] = body?.nodeIds || []

  if (!nodeIds.length || nodeIds.length > 50) {
    throw createError({ statusCode: 400, message: 'Provide 1-50 nodeIds' })
  }

  // Get user's Figma connection
  const { data: connection } = await supabase
    .from('figma_connections')
    .select('figma_pat, file_key')
    .eq('user_id', user.id)
    .single()

  if (!connection) {
    throw createError({ statusCode: 404, message: 'No Figma connection' })
  }

  try {
    const result = await getImages(connection.figma_pat, connection.file_key, nodeIds)
    return { images: result.images || {} }
  } catch (error: any) {
    if (error?.status === 403 || error?.statusCode === 403) {
      throw createError({ statusCode: 403, message: 'Figma token expired' })
    }
    throw createError({ statusCode: 500, message: 'Failed to fetch thumbnails' })
  }
})
