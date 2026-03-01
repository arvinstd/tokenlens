import { serverSupabaseClient } from '#supabase/server'
import { requireUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const supabase = await serverSupabaseClient(event)

  // Delete child data first
  await supabase.from('figma_tokens').delete().eq('user_id', user.id)
  await supabase.from('figma_components').delete().eq('user_id', user.id)

  // Delete connection
  await supabase.from('figma_connections').delete().eq('user_id', user.id)

  return { disconnected: true }
})
