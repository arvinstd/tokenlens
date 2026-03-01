import { serverSupabaseClient } from '#supabase/server'
import { getFileStyles, getFileComponents, getNodes, getLocalVariables } from '~/server/utils/figma-client'
import { parseAllStyles, parseVariables } from '~/server/utils/figma-parser'
import { requireUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const supabase = await serverSupabaseClient(event)

  // 1. Get user's Figma connection
  const { data: connection, error: connError } = await supabase
    .from('figma_connections')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (connError || !connection) {
    throw createError({ statusCode: 404, message: 'No Figma connection found. Connect first.' })
  }

  const { figma_pat: pat, file_key: fileKey } = connection

  // 2. Fetch styles + components + variables in parallel
  const [stylesResponse, fileData, variablesResponse] = await Promise.all([
    getFileStyles(pat, fileKey).catch((error: any) => {
      if (error?.status === 403 || error?.statusCode === 403) {
        throw createError({ statusCode: 403, message: 'Figma token expired or revoked' })
      }
      throw createError({ statusCode: 500, message: 'Failed to fetch Figma styles' })
    }),
    getFileComponents(pat, fileKey).catch(() => null),
    getLocalVariables(pat, fileKey).catch((error: any) => {
      // Variables API requires Enterprise/Organization plan — fail silently
      console.warn('[figma/sync] Variables API not available:', error?.status || error?.message)
      return null
    }),
  ])

  // === TOKENS (Styles + Variables) ===
  const styles = stylesResponse.meta?.styles || []

  // 3a. Parse style tokens (FILL, TEXT, EFFECT)
  let styleTokens: any[] = []
  if (styles.length > 0) {
    const nodeIds = styles.map(s => s.node_id)
    const allNodes: Record<string, { document: any }> = {}
    const BATCH_SIZE = 50

    for (let i = 0; i < nodeIds.length; i += BATCH_SIZE) {
      const batch = nodeIds.slice(i, i + BATCH_SIZE)
      try {
        const nodesResponse = await getNodes(pat, fileKey, batch)
        Object.assign(allNodes, nodesResponse.nodes)
      } catch {
        console.warn(`Failed to fetch nodes batch ${i}-${i + BATCH_SIZE}`)
      }
    }

    styleTokens = parseAllStyles(styles, allNodes)
    console.log(`[figma/sync] Parsed ${styleTokens.length} style tokens`)
  }

  // 3b. Parse variable tokens (COLOR, FLOAT — spacing, radius, etc.)
  let variableTokens: any[] = []
  if (variablesResponse?.meta) {
    const { variableCollections, variables } = variablesResponse.meta
    variableTokens = parseVariables(variableCollections, variables)
    console.log(`[figma/sync] Parsed ${variableTokens.length} variable tokens`)
  }

  // 4. Merge + deduplicate (variables take priority over styles for same name)
  const tokenMap = new Map<string, any>()
  for (const token of styleTokens) {
    tokenMap.set(token.name, token)
  }
  for (const token of variableTokens) {
    tokenMap.set(token.name, token) // variables override styles
  }
  const tokens = Array.from(tokenMap.values())

  console.log(`[figma/sync] Total: ${styleTokens.length} styles + ${variableTokens.length} variables → ${tokens.length} unique tokens`)

  // 5. Replace old tokens in DB
  if (tokens.length > 0) {
    await supabase.from('figma_tokens').delete().eq('user_id', user.id)

    const BATCH = 50
    for (let i = 0; i < tokens.length; i += BATCH) {
      const batch = tokens.slice(i, i + BATCH)
      const rows = batch.map((t: any) => ({
        user_id: user.id,
        name: t.name,
        category: t.category,
        figma_value: t.figmaValue,
        node_id: t.nodeId,
        style_type: t.styleType,
      }))

      const { error: insertError } = await supabase
        .from('figma_tokens')
        .upsert(rows, { onConflict: 'user_id,name' })

      if (insertError) {
        console.error(`Token upsert error (batch ${i}):`, insertError)
      }
    }
  }

  // === COMPONENTS ===
  let componentCount = 0
  if (fileData?.meta?.components) {
    const components = fileData.meta.components

    // Helper: detect variant-like names (contain "Property=Value")
    const isVariantName = (name: string) => /\w+=\w+/.test(name)

    // ── PASS 1: Group by component_set or containing_frame ──
    const setMap = new Map<string, { name: string; description: string; nodeId: string; variants: number; pageName: string }>()
    const standaloneComponents: Array<{ nodeId: string; name: string; description: string; pageName: string }> = []

    for (const comp of components) {
      const pageName = comp.containing_frame?.pageName || 'Uncategorized'
      const set = comp.containing_component_set

      if (set) {
        // Explicit component set — group variants under set name
        if (!setMap.has(set.nodeId)) {
          setMap.set(set.nodeId, {
            name: set.name,
            description: '',
            nodeId: set.nodeId,
            variants: 0,
            pageName,
          })
        }
        const entry = setMap.get(set.nodeId)!
        entry.variants++
        if (!entry.description && comp.description) {
          entry.description = comp.description
        }
      } else if (isVariantName(comp.name) && comp.containing_frame) {
        // Variant-like name — group under containing frame
        const frameKey = comp.containing_frame.nodeId
        const frameName = comp.containing_frame.name

        if (!setMap.has(frameKey)) {
          setMap.set(frameKey, {
            name: frameName,
            description: '',
            nodeId: frameKey,
            variants: 0,
            pageName,
          })
        }
        const entry = setMap.get(frameKey)!
        entry.variants++
        if (!entry.description && comp.description) {
          entry.description = comp.description
        }
      } else {
        standaloneComponents.push({
          nodeId: comp.node_id,
          name: comp.name,
          description: comp.description || '',
          pageName,
        })
      }
    }

    // ── PASS 2: Clean up remaining variant-like names ──
    // 2a. Clean setMap entries that still have "=" in their name
    for (const [key, data] of setMap) {
      if (isVariantName(data.name)) {
        // Strip "=Value" parts: "Active=False, Hover=False" → "Active, Hover"
        // Single prop: "Action oriented=False" → "Action oriented"
        const cleaned = data.name
          .split(',')
          .map(part => part.trim().split('=')[0].trim())
          .filter(Boolean)
          .join(', ')
        data.name = cleaned || data.name
      }
    }

    // 2b. Re-group standalone components that still have "=" in their name
    const cleanStandalone: typeof standaloneComponents = []
    for (const comp of standaloneComponents) {
      if (!isVariantName(comp.name)) {
        cleanStandalone.push(comp)
        continue
      }
      // Extract base name: "Action oriented=False" → "Action oriented"
      const baseName = comp.name
        .split(',')
        .map(part => part.trim().split('=')[0].trim())
        .filter(Boolean)
        .join(', ')

      // Group by cleaned name + page to avoid cross-page collisions
      const groupKey = `cleaned:${baseName}:${comp.pageName}`
      if (!setMap.has(groupKey)) {
        setMap.set(groupKey, {
          name: baseName,
          description: comp.description,
          nodeId: comp.nodeId,
          variants: 0,
          pageName: comp.pageName,
        })
      }
      const entry = setMap.get(groupKey)!
      entry.variants++
      if (!entry.description && comp.description) {
        entry.description = comp.description
      }
    }

    // ── BUILD ROWS ──
    const componentRows: any[] = []

    // Component sets (with variants)
    for (const [, data] of setMap) {
      componentRows.push({
        user_id: user.id,
        name: data.name,
        description: data.description,
        figma_node_id: data.nodeId,
        component_set_name: data.name,
        variant_count: data.variants,
        page_name: data.pageName,
      })
    }

    // Standalone components (only truly clean names remain)
    for (const comp of cleanStandalone) {
      componentRows.push({
        user_id: user.id,
        name: comp.name,
        description: comp.description,
        figma_node_id: comp.nodeId,
        component_set_name: null,
        variant_count: 1,
        page_name: comp.pageName,
      })
    }

    console.log(`[figma/sync] Found ${setMap.size} grouped + ${cleanStandalone.length} standalone = ${componentRows.length} components`)

    // Replace old components
    await supabase.from('figma_components').delete().eq('user_id', user.id)

    if (componentRows.length > 0) {
      // Deduplicate by name (keep first occurrence)
      const nameMap = new Map<string, any>()
      for (const row of componentRows) {
        if (!nameMap.has(row.name)) {
          nameMap.set(row.name, row)
        } else {
          // Same name → merge variant count
          nameMap.get(row.name).variant_count += row.variant_count
        }
      }
      const dedupedRows = Array.from(nameMap.values())

      const BATCH = 50
      for (let i = 0; i < dedupedRows.length; i += BATCH) {
        const batch = dedupedRows.slice(i, i + BATCH)
        const { error: compError } = await supabase
          .from('figma_components')
          .upsert(batch, { onConflict: 'user_id,name' })

        if (compError) {
          console.error(`Component upsert error (batch ${i}):`, compError)
        }
      }

      componentCount = dedupedRows.length
    }
  }

  // Update last_synced_at
  await supabase
    .from('figma_connections')
    .update({ last_synced_at: new Date().toISOString() })
    .eq('user_id', user.id)

  // Build category counts
  const categories: Record<string, number> = {}
  for (const token of tokens) {
    categories[token.category] = (categories[token.category] || 0) + 1
  }

  return {
    tokenCount: tokens.length,
    componentCount,
    categories,
  }
})
