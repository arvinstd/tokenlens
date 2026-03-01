import { serverSupabaseClient } from '#supabase/server'
import { requireUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const supabase = await serverSupabaseClient(event)

  const query = getQuery(event)
  const category = query.category as string | undefined

  let request = supabase
    .from('code_tokens')
    .select('*')
    .eq('user_id', user.id)
    .order('category')
    .order('name')

  if (category) {
    request = request.eq('category', category)
  }

  const { data, error } = await request

  if (error) {
    throw createError({ statusCode: 500, message: 'Failed to fetch code tokens' })
  }

  return data || []
})
