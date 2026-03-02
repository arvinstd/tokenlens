import { serverSupabaseClient } from '#supabase/server'
import { requireUser } from '~/server/utils/auth'
import { parseImportedVariables } from '~/server/utils/variable-import-parser'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const supabase = await serverSupabaseClient(event)
  const body = await readBody(event)

  if (!body.json || typeof body.json !== 'string') {
    throw createError({ statusCode: 400, message: 'Missing "json" field with variable export data' })
  }

  // 1. Parse the JSON
  const { tokens, format, error } = parseImportedVariables(body.json)

  if (error) {
    throw createError({ statusCode: 400, message: error })
  }

  if (tokens.length === 0) {
    throw createError({ statusCode: 400, message: 'No design tokens found in the JSON. Check the format.' })
  }

  console.log(`[import-variables] Parsed ${tokens.length} tokens from ${format} format`)

  // 2. Upsert tokens (merge with existing — don't delete styles)
  const BATCH = 50
  let importedCount = 0

  for (let i = 0; i < tokens.length; i += BATCH) {
    const batch = tokens.slice(i, i + BATCH)
    const rows = batch.map(t => ({
      user_id: user.id,
      name: t.name,
      category: t.category,
      figma_value: t.figmaValue,
      node_id: t.nodeId,
      style_type: t.styleType,
    }))

    const { error: upsertError } = await supabase
      .from('figma_tokens')
      .upsert(rows, { onConflict: 'user_id,name' })

    if (upsertError) {
      console.error(`Import upsert error (batch ${i}):`, upsertError)
    } else {
      importedCount += batch.length
    }
  }

  // 3. Build category counts from imported tokens
  const categories: Record<string, number> = {}
  for (const token of tokens) {
    categories[token.category] = (categories[token.category] || 0) + 1
  }

  return {
    importedCount,
    format,
    categories,
  }
})
