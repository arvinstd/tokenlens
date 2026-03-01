import { serverSupabaseClient } from '#supabase/server'
import { getFileContent } from '~/server/utils/github-client'
import { parseTailwindConfig } from '~/server/utils/tailwind-parser'
import { requireUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const supabase = await serverSupabaseClient(event)

  // 1. Get user's GitHub connection
  const { data: connection, error: connError } = await supabase
    .from('github_connections')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (connError || !connection) {
    throw createError({ statusCode: 404, message: 'No GitHub connection found. Connect first.' })
  }

  const { github_pat: pat, repo_owner: owner, repo_name: repo, config_path: configPath, default_branch: branch } = connection

  // 2. Fetch tailwind config content
  let configContent: string
  try {
    configContent = await getFileContent(pat, owner, repo, configPath, branch)
  } catch (error: any) {
    if (error?.status === 404) {
      throw createError({ statusCode: 404, message: `Config file not found: ${configPath}` })
    }
    if (error?.status === 403 || error?.statusCode === 403) {
      throw createError({ statusCode: 403, message: 'GitHub token expired or revoked' })
    }
    throw createError({ statusCode: 500, message: 'Failed to fetch config file from GitHub' })
  }

  // 3. Parse Tailwind config into tokens
  const parsedTokens = parseTailwindConfig(configContent)

  if (parsedTokens.length === 0) {
    console.warn('[github/sync] No tokens parsed from config')
  }

  console.log(`[github/sync] Parsed ${parsedTokens.length} tokens from ${configPath}`)

  // 4. Deduplicate by name
  const tokenMap = new Map<string, typeof parsedTokens[0]>()
  for (const token of parsedTokens) {
    tokenMap.set(token.name, token)
  }
  const tokens = Array.from(tokenMap.values())

  // 5. Replace old tokens
  await supabase.from('code_tokens').delete().eq('user_id', user.id)

  if (tokens.length > 0) {
    const BATCH = 50
    for (let i = 0; i < tokens.length; i += BATCH) {
      const batch = tokens.slice(i, i + BATCH)
      const rows = batch.map(t => ({
        user_id: user.id,
        name: t.name,
        category: t.category,
        code_value: t.codeValue,
        source_file: configPath,
      }))

      const { error: insertError } = await supabase
        .from('code_tokens')
        .upsert(rows, { onConflict: 'user_id,name' })

      if (insertError) {
        console.error(`[github/sync] Token upsert error (batch ${i}):`, insertError)
      }
    }
  }

  // 6. Update last_synced_at
  await supabase
    .from('github_connections')
    .update({ last_synced_at: new Date().toISOString() })
    .eq('user_id', user.id)

  // 7. Build category counts
  const categories: Record<string, number> = {}
  for (const token of tokens) {
    categories[token.category] = (categories[token.category] || 0) + 1
  }

  return {
    tokenCount: tokens.length,
    categories,
  }
})
