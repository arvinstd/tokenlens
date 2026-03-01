import { serverSupabaseClient } from '#supabase/server'
import { requireUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const supabase = await serverSupabaseClient(event)

  const { data: connection } = await supabase
    .from('figma_connections')
    .select('file_key, file_name, last_synced_at')
    .eq('user_id', user.id)
    .single()

  if (!connection) {
    return { connected: false }
  }

  // Get token count
  const { count } = await supabase
    .from('figma_tokens')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  return {
    connected: true,
    fileKey: connection.file_key,
    fileName: connection.file_name,
    lastSynced: connection.last_synced_at,
    tokenCount: count || 0,
  }
})
