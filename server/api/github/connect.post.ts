import { serverSupabaseClient } from '#supabase/server'
import { validateGitHubPat, getRepo, searchConfigFile, parseRepoUrl } from '~/server/utils/github-client'
import { requireUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const supabase = await serverSupabaseClient(event)

  const body = await readBody(event)
  const { pat, repoUrl } = body || {}

  if (!pat || !repoUrl) {
    throw createError({ statusCode: 400, message: 'GitHub PAT and repo URL are required' })
  }

  // 1. Parse repo URL
  const parsed = parseRepoUrl(repoUrl)
  if (!parsed) {
    throw createError({ statusCode: 400, message: 'Invalid repo URL. Use format: github.com/owner/repo or owner/repo' })
  }

  const { owner, repo } = parsed

  // 2. Validate PAT
  try {
    await validateGitHubPat(pat)
  } catch (error: any) {
    if (error?.status === 401) {
      throw createError({ statusCode: 401, message: 'Invalid GitHub token' })
    }
    throw createError({ statusCode: 500, message: 'Failed to validate GitHub token' })
  }

  // 3. Validate repo access
  let repoData
  try {
    repoData = await getRepo(pat, owner, repo)
  } catch (error: any) {
    if (error?.status === 404) {
      throw createError({ statusCode: 404, message: `Repo not found: ${owner}/${repo}` })
    }
    if (error?.status === 403) {
      throw createError({ statusCode: 403, message: 'No access to this repo with provided token' })
    }
    throw createError({ statusCode: 500, message: 'Failed to access repo' })
  }

  // 4. Auto-detect Tailwind config file
  const configPath = await searchConfigFile(pat, owner, repo)
  if (!configPath) {
    throw createError({
      statusCode: 404,
      message: 'No tailwind.config found in repo root. Supported: tailwind.config.ts/js/mjs/cjs',
    })
  }

  // 5. Upsert connection
  const { error: upsertError } = await supabase
    .from('github_connections')
    .upsert({
      user_id: user.id,
      github_pat: pat,
      repo_owner: owner,
      repo_name: repo,
      default_branch: repoData.default_branch,
      config_path: configPath,
    }, { onConflict: 'user_id' })

  if (upsertError) {
    console.error('[github/connect] Upsert error:', upsertError)
    throw createError({ statusCode: 500, message: 'Failed to save connection' })
  }

  return {
    connected: true,
    repoOwner: owner,
    repoName: repo,
    branch: repoData.default_branch,
    configPath,
  }
})
