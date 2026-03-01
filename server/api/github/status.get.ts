import { serverSupabaseClient } from '#supabase/server'
import { requireUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const supabase = await serverSupabaseClient(event)

  const { data: connection } = await supabase
    .from('github_connections')
    .select('repo_owner, repo_name, config_path, default_branch, last_synced_at')
    .eq('user_id', user.id)
    .single()

  if (!connection) {
    return { connected: false }
  }

  // Get token count
  const { count } = await supabase
    .from('code_tokens')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  return {
    connected: true,
    repoOwner: connection.repo_owner,
    repoName: connection.repo_name,
    configPath: connection.config_path,
    branch: connection.default_branch,
    lastSynced: connection.last_synced_at,
    tokenCount: count || 0,
  }
})
