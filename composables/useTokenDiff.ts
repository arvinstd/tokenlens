import type { TokenDiff, DiffSummaryData } from '~/types'

export function useTokenDiff() {
  const diffs = ref<TokenDiff[]>([])
  const summary = ref<DiffSummaryData | null>(null)
  const computing = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)

  /** Run diff computation (POST /api/diff/compute) */
  async function computeDiff() {
    computing.value = true
    error.value = null
    try {
      const data = await $fetch<DiffSummaryData>('/api/diff/compute', {
        method: 'POST',
      })
      summary.value = data
      // Refresh results after computing
      await fetchResults()
      return data
    } catch (e: any) {
      error.value = e?.data?.message || 'Failed to compute diff'
      throw e
    } finally {
      computing.value = false
    }
  }

  /** Fetch diff results (GET /api/diff/results) */
  async function fetchResults(filters?: { category?: string; status?: string }) {
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      if (filters?.category) params.set('category', filters.category)
      if (filters?.status) params.set('status', filters.status)
      const qs = params.toString() ? `?${params.toString()}` : ''

      const data = await $fetch<{ diffs: any[]; summary: DiffSummaryData }>(`/api/diff/results${qs}`)

      // Map DB format to client format
      diffs.value = data.diffs.map(d => ({
        tokenName: d.token_name,
        category: d.category,
        figmaValue: d.figma_value,
        codeValue: d.code_value,
        status: d.status,
        severity: d.severity,
      }))
      summary.value = data.summary

      return data
    } catch (e: any) {
      error.value = e?.data?.message || 'Failed to fetch diff results'
    } finally {
      loading.value = false
    }
  }

  /** Computed health score */
  const healthScore = computed(() => summary.value?.healthScore ?? 0)

  /** Group diffs by category with stats */
  const categories = computed(() => {
    const map = new Map<string, { name: string; total: number; synced: number; drifted: number; missing: number }>()

    for (const diff of diffs.value) {
      if (!map.has(diff.category)) {
        map.set(diff.category, { name: diff.category, total: 0, synced: 0, drifted: 0, missing: 0 })
      }
      const cat = map.get(diff.category)!
      cat.total++
      if (diff.status === 'synced') cat.synced++
      if (diff.status === 'drifted') cat.drifted++
      if (diff.status === 'missing_in_code' || diff.status === 'missing_in_figma') cat.missing++
    }

    return Array.from(map.values())
  })

  return {
    diffs,
    summary,
    computing,
    loading,
    error,
    computeDiff,
    fetchResults,
    healthScore,
    categories,
  }
}
