import { serverSupabaseClient } from '#supabase/server'
import { requireUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody(event)
  const client = await serverSupabaseClient(event)

  // Build update object from allowed fields
  const updates: Record<string, any> = {
    user_id: user.id,
    updated_at: new Date().toISOString(),
  }

  if (body.sourceOfTruth && ['figma', 'code'].includes(body.sourceOfTruth)) {
    updates.source_of_truth = body.sourceOfTruth
  }

  if (typeof body.onboardingCompleted === 'boolean') {
    updates.onboarding_completed = body.onboardingCompleted
  }

  const { data, error } = await client
    .from('user_preferences')
    .upsert(updates, { onConflict: 'user_id' })
    .select('source_of_truth, onboarding_completed')
    .single()

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return {
    sourceOfTruth: data.source_of_truth,
    onboardingCompleted: data.onboarding_completed,
  }
})
