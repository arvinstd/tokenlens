import { serverSupabaseClient } from '#supabase/server'
import { requireUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const supabase = await serverSupabaseClient(event)

  // Delete in order: diffs → code_tokens → connection
  await supabase.from('token_diffs').delete().eq('user_id', user.id)
  await supabase.from('code_tokens').delete().eq('user_id', user.id)
  await supabase.from('github_connections').delete().eq('user_id', user.id)

  return { disconnected: true }
})
