import type { GitHubConnection } from '~/types'

export function useGitHubConnection() {
  const connection = useState<GitHubConnection>('github-connection', () => ({
    connected: false,
  }))
  const syncing = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)

  /** Fetch current connection status */
  async function fetchStatus() {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<GitHubConnection>('/api/github/status')
      connection.value = data
    } catch (e: any) {
      error.value = e?.data?.message || 'Failed to fetch GitHub status'
    } finally {
      loading.value = false
    }
  }

  /** Connect to GitHub with PAT + repo URL */
  async function connect(pat: string, repoUrl: string) {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<{
        connected: boolean
        repoOwner: string
        repoName: string
        branch: string
        configPath: string
      }>('/api/github/connect', {
        method: 'POST',
        body: { pat, repoUrl },
      })
      connection.value = {
        connected: true,
        repoOwner: data.repoOwner,
        repoName: data.repoName,
        configPath: data.configPath,
      }
      return data
    } catch (e: any) {
      error.value = e?.data?.message || 'Failed to connect to GitHub'
      throw e
    } finally {
      loading.value = false
    }
  }

  /** Trigger a sync (extract tokens from Tailwind config) */
  async function sync() {
    syncing.value = true
    error.value = null
    try {
      const data = await $fetch<{ tokenCount: number; categories: Record<string, number> }>('/api/github/sync', {
        method: 'POST',
      })
      await fetchStatus()
      return data
    } catch (e: any) {
      error.value = e?.data?.message || 'GitHub sync failed'
      throw e
    } finally {
      syncing.value = false
    }
  }

  /** Disconnect from GitHub */
  async function disconnect() {
    loading.value = true
    error.value = null
    try {
      await $fetch('/api/github/disconnect', { method: 'POST' })
      connection.value = { connected: false }
    } catch (e: any) {
      error.value = e?.data?.message || 'Failed to disconnect'
    } finally {
      loading.value = false
    }
  }

  return {
    connection,
    syncing,
    loading,
    error,
    fetchStatus,
    connect,
    sync,
    disconnect,
  }
}
