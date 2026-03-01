import { serverSupabaseClient } from '#supabase/server'
import { requireUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const supabase = await serverSupabaseClient(event)

  const query = getQuery(event)
  const category = query.category as string | undefined
  const status = query.status as string | undefined

  let request = supabase
    .from('token_diffs')
    .select('*')
    .eq('user_id', user.id)
    .order('status')
    .order('severity', { nullsFirst: false })
    .order('token_name')

  if (category) {
    request = request.eq('category', category)
  }

  if (status) {
    request = request.eq('status', status)
  }

  const { data, error } = await request

  if (error) {
    throw createError({ statusCode: 500, message: 'Failed to fetch diff results' })
  }

  // Also compute summary from stored diffs
  const all = data || []
  const summary = {
    total: all.length,
    synced: all.filter(d => d.status === 'synced').length,
    drifted: all.filter(d => d.status === 'drifted').length,
    missingInCode: all.filter(d => d.status === 'missing_in_code').length,
    missingInFigma: all.filter(d => d.status === 'missing_in_figma').length,
    healthScore: all.length > 0
      ? Math.round((all.filter(d => d.status === 'synced').length / all.length) * 100)
      : 0,
  }

  return {
    diffs: all,
    summary,
  }
})
