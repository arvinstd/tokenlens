/**
 * Figma style parser
 * Converts Figma node data into normalized design tokens
 */

export interface ParsedToken {
  name: string
  category: string
  figmaValue: string
  nodeId: string
  styleType: string
}

/** Convert Figma RGBA (0-1) to hex string */
function rgbaToHex(color: { r: number; g: number; b: number; a?: number }): string {
  const r = Math.round(color.r * 255)
  const g = Math.round(color.g * 255)
  const b = Math.round(color.b * 255)
  const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  if (color.a !== undefined && color.a < 1) {
    const a = Math.round(color.a * 255)
    return `${hex}${a.toString(16).padStart(2, '0')}`.toUpperCase()
  }
  return hex.toUpperCase()
}

/** Normalize Figma style name to token name: "Brand/Primary" → "color.brand.primary" */
function normalizeTokenName(styleName: string, prefix: string): string {
  return `${prefix}.${styleName
    .replace(/\//g, '.')
    .replace(/\s+/g, '-')
    .toLowerCase()}`
}

/** Parse a FILL style node into color tokens */
export function parseColorStyle(styleName: string, node: any, nodeId: string): ParsedToken[] {
  const tokens: ParsedToken[] = []

  const fills = node?.fills || []
  if (fills.length > 0 && fills[0].type === 'SOLID' && fills[0].color) {
    tokens.push({
      name: normalizeTokenName(styleName, 'color'),
      category: 'Colors',
      figmaValue: rgbaToHex(fills[0].color),
      nodeId,
      styleType: 'FILL',
    })
  }

  return tokens
}

/** Parse a TEXT style node into typography tokens */
export function parseTextStyle(styleName: string, node: any, nodeId: string): ParsedToken[] {
  const tokens: ParsedToken[] = []
  const style = node?.style

  if (!style) return tokens

  const baseName = normalizeTokenName(styleName, 'font')

  if (style.fontSize) {
    tokens.push({
      name: `${baseName}.size`,
      category: 'Typography',
      figmaValue: `${style.fontSize}px`,
      nodeId,
      styleType: 'TEXT',
    })
  }

  if (style.fontWeight) {
    tokens.push({
      name: `${baseName}.weight`,
      category: 'Typography',
      figmaValue: String(style.fontWeight),
      nodeId,
      styleType: 'TEXT',
    })
  }

  if (style.fontFamily) {
    tokens.push({
      name: `${baseName}.family`,
      category: 'Typography',
      figmaValue: style.fontFamily,
      nodeId,
      styleType: 'TEXT',
    })
  }

  if (style.lineHeightPx) {
    tokens.push({
      name: `${baseName}.line-height`,
      category: 'Typography',
      figmaValue: `${Math.round(style.lineHeightPx)}px`,
      nodeId,
      styleType: 'TEXT',
    })
  }

  if (style.letterSpacing !== undefined && style.letterSpacing !== 0) {
    tokens.push({
      name: `${baseName}.letter-spacing`,
      category: 'Typography',
      figmaValue: `${style.letterSpacing}px`,
      nodeId,
      styleType: 'TEXT',
    })
  }

  return tokens
}

/** Parse an EFFECT style node into shadow tokens */
export function parseEffectStyle(styleName: string, node: any, nodeId: string): ParsedToken[] {
  const tokens: ParsedToken[] = []
  const effects = node?.effects || []

  const shadows = effects.filter((e: any) => e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW')

  if (shadows.length > 0) {
    const shadow = shadows[0]
    const x = shadow.offset?.x ?? 0
    const y = shadow.offset?.y ?? 0
    const blur = shadow.radius ?? 0
    const spread = shadow.spread ?? 0
    const color = shadow.color ? rgbaToHex(shadow.color) : '#000000'
    const opacity = shadow.color?.a !== undefined ? shadow.color.a : 1
    const alphaHex = Math.round(opacity * 255).toString(16).padStart(2, '0')

    const value = `${x}px ${y}px ${blur}px ${spread}px ${color.slice(0, 7)}${alphaHex}`

    tokens.push({
      name: normalizeTokenName(styleName, 'shadow'),
      category: 'Shadows',
      figmaValue: value.toUpperCase(),
      nodeId,
      styleType: 'EFFECT',
    })
  }

  return tokens
}

/** Parse all styles from Figma nodes into tokens */
export function parseAllStyles(
  styles: Array<{ name: string; node_id: string; style_type: string }>,
  nodes: Record<string, { document: any }>
): ParsedToken[] {
  const allTokens: ParsedToken[] = []

  for (const style of styles) {
    const nodeData = nodes[style.node_id]
    if (!nodeData?.document) continue

    const doc = nodeData.document

    switch (style.style_type) {
      case 'FILL':
        allTokens.push(...parseColorStyle(style.name, doc, style.node_id))
        break
      case 'TEXT':
        allTokens.push(...parseTextStyle(style.name, doc, style.node_id))
        break
      case 'EFFECT':
        allTokens.push(...parseEffectStyle(style.name, doc, style.node_id))
        break
      // GRID styles are skipped for now
    }
  }

  return allTokens
}

// ═══════════════════════════════════════════════════
// FIGMA VARIABLES PARSER
// ═══════════════════════════════════════════════════

interface VariableCollection {
  id: string
  name: string
  modes: Array<{ modeId: string; name: string }>
  defaultModeId: string
  variableIds: string[]
}

interface FigmaVariable {
  id: string
  name: string
  resolvedType: 'COLOR' | 'FLOAT' | 'STRING' | 'BOOLEAN'
  valuesByMode: Record<string, any>
  scopes: string[]
  codeSyntax?: { WEB?: string }
}

/** Detect category from variable scopes, collection name, or variable name */
function detectVariableCategory(
  variable: FigmaVariable,
  collectionName: string
): string {
  const name = variable.name.toLowerCase()
  const collection = collectionName.toLowerCase()
  const scopes = variable.scopes || []

  // By resolved type
  if (variable.resolvedType === 'COLOR') return 'Colors'

  // By Figma scopes
  if (scopes.includes('GAP') || scopes.includes('WIDTH_HEIGHT')) return 'Spacing'
  if (scopes.includes('CORNER_RADIUS')) return 'Border Radius'
  if (scopes.includes('FONT_SIZE') || scopes.includes('LINE_HEIGHT') || scopes.includes('FONT_WEIGHT') || scopes.includes('LETTER_SPACING')) return 'Typography'
  if (scopes.includes('STROKE_FLOAT')) return 'Border Width'
  if (scopes.includes('OPACITY')) return 'Opacity'
  if (scopes.includes('EFFECT_FLOAT')) return 'Shadows'

  // By variable name patterns
  if (/spacing|gap|padding|margin/i.test(name)) return 'Spacing'
  if (/radius|corner|rounded/i.test(name)) return 'Border Radius'
  if (/font|text|typo|line.?height|letter.?spacing/i.test(name)) return 'Typography'
  if (/shadow|elevation/i.test(name)) return 'Shadows'
  if (/border.?width|stroke/i.test(name)) return 'Border Width'
  if (/opacity|alpha/i.test(name)) return 'Opacity'
  if (/size|width|height/i.test(name)) return 'Sizing'
  if (/color|brand|accent|neutral|grey|gray|surface|background|foreground/i.test(name)) return 'Colors'

  // By collection name
  if (/color/i.test(collection)) return 'Colors'
  if (/spacing/i.test(collection)) return 'Spacing'
  if (/radius/i.test(collection)) return 'Border Radius'
  if (/typo/i.test(collection)) return 'Typography'
  if (/shadow/i.test(collection)) return 'Shadows'
  if (/size|sizing/i.test(collection)) return 'Sizing'

  // Fallback based on type
  if (variable.resolvedType === 'FLOAT') return 'Spacing'
  return 'Other'
}

/** Detect token name prefix from category */
function categoryToPrefix(category: string): string {
  switch (category) {
    case 'Colors': return 'color'
    case 'Spacing': return 'spacing'
    case 'Border Radius': return 'border-radius'
    case 'Typography': return 'font'
    case 'Shadows': return 'shadow'
    case 'Sizing': return 'sizing'
    case 'Border Width': return 'border-width'
    case 'Opacity': return 'opacity'
    default: return 'var'
  }
}

/** Resolve a variable value, following aliases to final values */
function resolveVariableValue(
  value: any,
  resolvedType: string,
  allVariables: Record<string, FigmaVariable>,
  defaultModeIds: Map<string, string>,
  visited: Set<string> = new Set()
): string | null {
  // Handle alias (variable reference)
  if (value && typeof value === 'object' && value.type === 'VARIABLE_ALIAS') {
    const aliasId = value.id
    if (visited.has(aliasId)) return null // circular reference
    visited.add(aliasId)

    const aliasVar = allVariables[aliasId]
    if (!aliasVar) return null

    // Get default mode value of the alias
    // Find which collection this alias belongs to
    const aliasModeId = findDefaultModeForVariable(aliasVar, defaultModeIds)
    if (!aliasModeId) return null

    const aliasValue = aliasVar.valuesByMode[aliasModeId]
    return resolveVariableValue(aliasValue, aliasVar.resolvedType, allVariables, defaultModeIds, visited)
  }

  // Handle COLOR
  if (resolvedType === 'COLOR' && value && typeof value === 'object' && 'r' in value) {
    return rgbaToHex(value)
  }

  // Handle FLOAT
  if (resolvedType === 'FLOAT' && typeof value === 'number') {
    // Round to 2 decimal places
    const rounded = Math.round(value * 100) / 100
    return String(rounded)
  }

  // Handle STRING
  if (resolvedType === 'STRING' && typeof value === 'string') {
    return value
  }

  // Handle BOOLEAN
  if (resolvedType === 'BOOLEAN' && typeof value === 'boolean') {
    return String(value)
  }

  return value !== undefined && value !== null ? String(value) : null
}

/** Find the default mode ID for a variable by checking its valuesByMode keys */
function findDefaultModeForVariable(
  variable: FigmaVariable,
  defaultModeIds: Map<string, string>
): string | null {
  const modeIds = Object.keys(variable.valuesByMode)
  // Try to match with known default modes
  for (const modeId of modeIds) {
    if (defaultModeIds.has(modeId)) return modeId
  }
  // Fallback: use first mode
  return modeIds[0] || null
}

/** Parse Figma Variables into normalized tokens */
export function parseVariables(
  collections: Record<string, VariableCollection>,
  variables: Record<string, FigmaVariable>
): ParsedToken[] {
  const tokens: ParsedToken[] = []

  // Build default mode map: modeId → collectionId
  const defaultModeIds = new Map<string, string>()
  for (const [, collection] of Object.entries(collections)) {
    defaultModeIds.set(collection.defaultModeId, collection.id)
  }

  // Build collection lookup: variableId → collectionName
  const variableToCollection = new Map<string, string>()
  for (const [, collection] of Object.entries(collections)) {
    for (const varId of collection.variableIds) {
      variableToCollection.set(varId, collection.name)
    }
  }

  for (const [varId, variable] of Object.entries(variables)) {
    // Skip BOOLEAN and STRING variables (not design tokens)
    if (variable.resolvedType === 'BOOLEAN' || variable.resolvedType === 'STRING') continue

    const collectionName = variableToCollection.get(varId) || 'Unknown'
    const category = detectVariableCategory(variable, collectionName)
    const prefix = categoryToPrefix(category)

    // Get the default mode value
    const defaultModeId = findDefaultModeForVariable(variable, defaultModeIds)
    if (!defaultModeId) continue

    const rawValue = variable.valuesByMode[defaultModeId]
    const resolvedValue = resolveVariableValue(rawValue, variable.resolvedType, variables, defaultModeIds)
    if (!resolvedValue) continue

    // Normalize variable name: "spacing/sm" → "spacing.sm", "Colors/Brand/Primary" → "color.brand.primary"
    const normalizedName = normalizeTokenName(variable.name, prefix)

    tokens.push({
      name: normalizedName,
      category,
      figmaValue: resolvedValue,
      nodeId: varId,
      styleType: `VARIABLE_${variable.resolvedType}`,
    })
  }

  return tokens
}
