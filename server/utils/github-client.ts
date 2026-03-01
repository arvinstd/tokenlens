/**
 * GitHub REST API client
 * Thin wrapper with retry logic for rate limiting
 */

const GITHUB_API = 'https://api.github.com'

interface GitHubRequestOptions {
  pat: string
  retries?: number
}

async function githubFetch<T>(path: string, { pat, retries = 2 }: GitHubRequestOptions): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await $fetch(`${GITHUB_API}${path}`, {
        headers: {
          'Authorization': `Bearer ${pat}`,
          'Accept': 'application/vnd.github.v3+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      })
      return result as T
    } catch (error: any) {
      // Rate limited — wait and retry
      if (error?.status === 403 && attempt < retries) {
        const rateLimitRemaining = error?.response?.headers?.get?.('x-ratelimit-remaining')
        if (rateLimitRemaining === '0' || rateLimitRemaining === 0) {
          const wait = Math.pow(2, attempt + 1) * 1000
          await new Promise(resolve => setTimeout(resolve, wait))
          continue
        }
      }
      // Server error — retry
      if (error?.status >= 500 && attempt < retries) {
        const wait = Math.pow(2, attempt + 1) * 1000
        await new Promise(resolve => setTimeout(resolve, wait))
        continue
      }
      throw error
    }
  }
  throw new Error('GitHub API request failed after retries')
}

/** Validate a GitHub PAT by fetching /user */
export async function validateGitHubPat(pat: string) {
  return githubFetch<{ id: number; login: string; email: string | null }>('/user', { pat })
}

/** Get repo metadata (validate access) */
export async function getRepo(pat: string, owner: string, repo: string) {
  return githubFetch<{
    id: number
    full_name: string
    default_branch: string
    private: boolean
  }>(`/repos/${owner}/${repo}`, { pat })
}

/** Get file content (returns decoded string) */
export async function getFileContent(
  pat: string,
  owner: string,
  repo: string,
  path: string,
  branch?: string
): Promise<string> {
  const ref = branch ? `?ref=${encodeURIComponent(branch)}` : ''
  const data = await githubFetch<{
    content: string
    encoding: string
    size: number
    name: string
  }>(`/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}${ref}`, { pat })

  if (data.encoding === 'base64') {
    // Decode base64 content
    return Buffer.from(data.content, 'base64').toString('utf-8')
  }

  return data.content
}

/** Search for a file in the repo (auto-detect config location) */
export async function searchConfigFile(
  pat: string,
  owner: string,
  repo: string
): Promise<string | null> {
  // Try common paths in order
  const candidates = [
    'tailwind.config.ts',
    'tailwind.config.js',
    'tailwind.config.mjs',
    'tailwind.config.cjs',
  ]

  for (const path of candidates) {
    try {
      await githubFetch(`/repos/${owner}/${repo}/contents/${path}`, { pat, retries: 0 })
      return path
    } catch {
      // File not found, try next
    }
  }

  return null
}

/** Parse a GitHub repo URL into owner/repo */
export function parseRepoUrl(url: string): { owner: string; repo: string } | null {
  // Handle full URLs: https://github.com/owner/repo
  const urlMatch = url.match(/github\.com\/([^/]+)\/([^/\s?.#]+)/)
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2].replace(/\.git$/, '') }
  }

  // Handle owner/repo format
  const shortMatch = url.match(/^([^/\s]+)\/([^/\s]+)$/)
  if (shortMatch) {
    return { owner: shortMatch[1], repo: shortMatch[2].replace(/\.git$/, '') }
  }

  return null
}
