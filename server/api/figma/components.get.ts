import { serverSupabaseClient } from '#supabase/server'
import { requireUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const supabase = await serverSupabaseClient(event)

  const { data: components, error } = await supabase
    .from('figma_components')
    .select('*')
    .eq('user_id', user.id)
    .order('name')

  if (error) {
    throw createError({ statusCode: 500, message: 'Failed to fetch components' })
  }

  return components || []
})
