import type { FigmaComponent } from '~/types'

export function useFigmaComponents() {
  const components = ref<FigmaComponent[]>([])
  const loading = ref(false)

  async function fetchComponents() {
    loading.value = true
    try {
      const data = await $fetch<FigmaComponent[]>('/api/figma/components')
      components.value = data
    } catch {
      // Silently fail — page will show mock data
    } finally {
      loading.value = false
    }
  }

  const componentCount = computed(() => components.value.length)

  const totalVariants = computed(() =>
    components.value.reduce((sum, c) => sum + c.variant_count, 0),
  )

  return {
    components,
    loading,
    fetchComponents,
    componentCount,
    totalVariants,
  }
}
