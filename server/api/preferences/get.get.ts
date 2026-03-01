import { serverSupabaseClient } from '#supabase/server'
import { requireUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const client = await serverSupabaseClient(event)

  const { data, error } = await client
    .from('user_preferences')
    .select('source_of_truth, onboarding_completed')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows found (expected for new users)
    throw createError({ statusCode: 500, message: error.message })
  }

  return {
    sourceOfTruth: data?.source_of_truth ?? 'figma',
    onboardingCompleted: data?.onboarding_completed ?? false,
  }
})
