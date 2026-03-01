import { serverSupabaseClient } from '#supabase/server'
import { computeDiffs, computeSummary } from '~/server/utils/token-diff'
import { requireUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const supabase = await serverSupabaseClient(event)

  // 1. Fetch Figma tokens
  const { data: figmaTokens, error: figmaError } = await supabase
    .from('figma_tokens')
    .select('name, category, figma_value')
    .eq('user_id', user.id)

  if (figmaError) {
    throw createError({ statusCode: 500, message: 'Failed to fetch Figma tokens' })
  }

  // 2. Fetch Code tokens
  const { data: codeTokens, error: codeError } = await supabase
    .from('code_tokens')
    .select('name, category, code_value')
    .eq('user_id', user.id)

  if (codeError) {
    throw createError({ statusCode: 500, message: 'Failed to fetch code tokens' })
  }

  if (!figmaTokens?.length && !codeTokens?.length) {
    return {
      total: 0,
      synced: 0,
      drifted: 0,
      missingInCode: 0,
      missingInFigma: 0,
      healthScore: 0,
      message: 'No tokens to compare. Sync Figma and GitHub first.',
    }
  }

  // 3. Run diff engine
  const figmaEntries = (figmaTokens || []).map(t => ({
    name: t.name,
    category: t.category,
    value: t.figma_value,
  }))

  const codeEntries = (codeTokens || []).map(t => ({
    name: t.name,
    category: t.category,
    value: t.code_value,
  }))

  const diffs = computeDiffs(figmaEntries, codeEntries)
  const summary = computeSummary(diffs)

  console.log(`[diff/compute] ${summary.total} tokens: ${summary.synced} synced, ${summary.drifted} drifted, ${summary.missingInCode} missing in code, ${summary.missingInFigma} missing in figma → ${summary.healthScore}% health`)

  // 4. Store diffs in database
  await supabase.from('token_diffs').delete().eq('user_id', user.id)

  if (diffs.length > 0) {
    const BATCH = 50
    for (let i = 0; i < diffs.length; i += BATCH) {
      const batch = diffs.slice(i, i + BATCH)
      const rows = batch.map(d => ({
        user_id: user.id,
        token_name: d.tokenName,
        category: d.category,
        figma_value: d.figmaValue,
        code_value: d.codeValue,
        status: d.status,
        severity: d.severity,
      }))

      const { error: insertError } = await supabase
        .from('token_diffs')
        .upsert(rows, { onConflict: 'user_id,token_name' })

      if (insertError) {
        console.error(`[diff/compute] Upsert error (batch ${i}):`, insertError)
      }
    }
  }

  return summary
})
