export function usePreferences() {
  const sourceOfTruth = useState<'figma' | 'code'>('source-of-truth', () => 'figma')
  const onboardingCompleted = useState<boolean>('onboarding-completed', () => false)
  const loading = ref(false)
  const error = ref<string | null>(null)

  /** Fetch preferences from server */
  async function fetchPreferences() {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<{ sourceOfTruth: 'figma' | 'code'; onboardingCompleted: boolean }>('/api/preferences/get')
      sourceOfTruth.value = data.sourceOfTruth
      onboardingCompleted.value = data.onboardingCompleted
      return data
    } catch (e: any) {
      error.value = e?.data?.message || 'Failed to fetch preferences'
    } finally {
      loading.value = false
    }
  }

  /** Update preferences on server */
  async function updatePreferences(prefs: { sourceOfTruth?: 'figma' | 'code'; onboardingCompleted?: boolean }) {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<{ sourceOfTruth: 'figma' | 'code'; onboardingCompleted: boolean }>('/api/preferences/update', {
        method: 'POST',
        body: prefs,
      })
      sourceOfTruth.value = data.sourceOfTruth
      onboardingCompleted.value = data.onboardingCompleted
      return data
    } catch (e: any) {
      error.value = e?.data?.message || 'Failed to update preferences'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    sourceOfTruth,
    onboardingCompleted,
    loading,
    error,
    fetchPreferences,
    updatePreferences,
  }
}
