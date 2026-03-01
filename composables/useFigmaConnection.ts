import type { FigmaConnection } from '~/types'

export function useFigmaConnection() {
  const connection = useState<FigmaConnection>('figma-connection', () => ({
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
      const data = await $fetch<FigmaConnection>('/api/figma/status')
      connection.value = data
    } catch (e: any) {
      error.value = e?.data?.message || 'Failed to fetch status'
    } finally {
      loading.value = false
    }
  }

  /** Connect to Figma with PAT + file key */
  async function connect(pat: string, fileKey: string) {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<{ connected: boolean; fileName: string; fileKey: string }>('/api/figma/connect', {
        method: 'POST',
        body: { pat, fileKey },
      })
      connection.value = {
        connected: true,
        fileName: data.fileName,
        fileKey: data.fileKey,
      }
      return data
    } catch (e: any) {
      error.value = e?.data?.message || 'Failed to connect'
      throw e
    } finally {
      loading.value = false
    }
  }

  /** Trigger a sync (extract tokens from Figma) */
  async function sync() {
    syncing.value = true
    error.value = null
    try {
      const data = await $fetch<{ tokenCount: number; componentCount: number; categories: Record<string, number>; debug?: { styleTokens: number; variableTokens: number; variablesStatus: string; variablesError: string | null } }>('/api/figma/sync', {
        method: 'POST',
      })
      // Refresh connection status after sync
      await fetchStatus()
      return data
    } catch (e: any) {
      error.value = e?.data?.message || 'Sync failed'
      throw e
    } finally {
      syncing.value = false
    }
  }

  /** Disconnect from Figma */
  async function disconnect() {
    loading.value = true
    error.value = null
    try {
      await $fetch('/api/figma/disconnect', { method: 'POST' })
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
