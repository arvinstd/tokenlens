import type { FigmaToken, Category, HealthScore } from '~/types'

export function useFigmaTokens() {
  const tokens = ref<FigmaToken[]>([])
  const loading = ref(false)

  /** Fetch tokens from API */
  async function fetchTokens(category?: string) {
    loading.value = true
    try {
      const query = category ? `?category=${encodeURIComponent(category)}` : ''
      tokens.value = await $fetch<FigmaToken[]>(`/api/figma/tokens${query}`)
    } catch {
      tokens.value = []
    } finally {
      loading.value = false
    }
  }

  /** Compute categories from tokens */
  const categories = computed<Category[]>(() => {
    const categoryMap = new Map<string, { count: number }>()

    for (const token of tokens.value) {
      const existing = categoryMap.get(token.category)
      if (existing) {
        existing.count++
      } else {
        categoryMap.set(token.category, { count: 1 })
      }
    }

    const iconMap: Record<string, string> = {
      Colors: 'palette',
      Typography: 'type',
      Shadows: 'sun',
      Spacing: 'square',
      'Border Radius': 'box',
      Sizing: 'layers',
    }

    return Array.from(categoryMap.entries()).map(([name, data]) => ({
      name,
      icon: iconMap[name] || 'circle',
      count: data.count,
      synced: data.count, // Figma-only mode: all are "synced" (no code comparison yet)
      drifted: 0,
      missing: 0,
      score: 100,
      delta: 0,
    }))
  })

  /** Compute health score (Figma-only = 100% until code comparison is added) */
  const healthScore = computed<HealthScore>(() => ({
    score: tokens.value.length > 0 ? 100 : 0,
    change: 0,
    totalTokens: tokens.value.length,
    synced: tokens.value.length,
    drifted: 0,
    missing: 0,
  }))

  return {
    tokens,
    loading,
    fetchTokens,
    categories,
    healthScore,
  }
}
