import { serverSupabaseClient } from '#supabase/server'
import { requireUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const supabase = await serverSupabaseClient(event)
  const query = getQuery(event)

  let request = supabase
    .from('figma_tokens')
    .select('*')
    .eq('user_id', user.id)
    .order('category')
    .order('name')

  // Optional category filter
  if (query.category && typeof query.category === 'string') {
    request = request.eq('category', query.category)
  }

  const { data: tokens, error } = await request

  if (error) {
    throw createError({ statusCode: 500, message: 'Failed to fetch tokens' })
  }

  return tokens || []
})
