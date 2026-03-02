/**
 * Figma Variable JSON Import Parser
 *
 * Supports two common export formats:
 * 1. variables2json plugin format (collections → modes → variables)
 * 2. W3C DTCG / Tokens Studio flat format ($value, $type)
 * 3. Simple flat key-value format ({ "color.primary": "#FF0000" })
 */

import type { ParsedToken } from './figma-parser'

// ─── variables2json format ───────────────────────────────

interface V2JColor { r: number; g: number; b: number; a?: number }

interface V2JVariable {
  name: string
  type: string
  value: any
  isAlias?: boolean
  aliasPath?: string
}

interface V2JMode {
  name: string
  variables: V2JVariable[]
}

interface V2JCollection {
  name: string
  modes: V2JMode[]
}

interface V2JRoot {
  version?: string
  metadata?: any
  collections: V2JCollection[]
}

// ─── W3C DTCG format ────────────────────────────────────

interface DTCGToken {
  $value: any
  $type?: string
  $description?: string
}

// ─── Detection ──────────────────────────────────────────

type ImportFormat = 'variables2json' | 'dtcg' | 'flat' | 'unknown'

function detectFormat(json: any): ImportFormat {
  if (json.collections && Array.isArray(json.collections)) {
    return 'variables2json'
  }

  // DTCG: look for $value/$type pattern
  const keys = Object.keys(json)
  for (const key of keys) {
    const val = json[key]
    if (val && typeof val === 'object') {
      if ('$value' in val && '$type' in val) return 'dtcg'
      // Check nested groups
      for (const subKey of Object.keys(val)) {
        const subVal = val[subKey]
        if (subVal && typeof subVal === 'object' && '$value' in subVal) return 'dtcg'
      }
    }
  }

  // Flat: simple key-value pairs
  if (keys.length > 0 && keys.every(k => typeof json[k] === 'string' || typeof json[k] === 'number')) {
    return 'flat'
  }

  return 'unknown'
}

// ─── Color helpers ──────────────────────────────────────

function rgbaToHex(color: V2JColor): string {
  // variables2json uses 0-255 for RGB, but some use 0-1
  const isNormalized = color.r <= 1 && color.g <= 1 && color.b <= 1
  const r = isNormalized ? Math.round(color.r * 255) : Math.round(color.r)
  const g = isNormalized ? Math.round(color.g * 255) : Math.round(color.g)
  const b = isNormalized ? Math.round(color.b * 255) : Math.round(color.b)
  const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  if (color.a !== undefined && color.a < 1) {
    const a = Math.round(color.a * 255)
    return `${hex}${a.toString(16).padStart(2, '0')}`.toUpperCase()
  }
  return hex.toUpperCase()
}

function isColorString(value: string): boolean {
  return /^#[0-9A-Fa-f]{3,8}$/.test(value)
}

// ─── Category detection ─────────────────────────────────

function detectCategory(name: string, type: string, value: any): string {
  if (type === 'color' || (typeof value === 'string' && isColorString(value))) return 'Colors'
  if (/spacing|gap|padding|margin/i.test(name)) return 'Spacing'
  if (/radius|corner|rounded/i.test(name)) return 'Border Radius'
  if (/font|text|typo|line.?height|letter.?spacing/i.test(name)) return 'Typography'
  if (/shadow|elevation/i.test(name)) return 'Shadows'
  if (/border.?width|stroke/i.test(name)) return 'Border Width'
  if (/opacity|alpha/i.test(name)) return 'Opacity'
  if (/size|width|height/i.test(name)) return 'Sizing'
  if (/color|brand|accent|neutral|grey|gray|surface|background|foreground/i.test(name)) return 'Colors'
  if (type === 'number') return 'Spacing'
  return 'Other'
}

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

/** Normalize name: "Colors/Brand/Primary" → "color.brand.primary" */
function normalizeName(rawName: string, prefix: string): string {
  const cleaned = rawName
    .replace(/\//g, '.')
    .replace(/\s+/g, '-')
    .toLowerCase()
  // Avoid double prefix: "color.color.brand" → "color.brand"
  if (cleaned.startsWith(`${prefix}.`)) return cleaned
  return `${prefix}.${cleaned}`
}

// ─── variables2json parser ──────────────────────────────

function parseV2J(data: V2JRoot): ParsedToken[] {
  const tokens: ParsedToken[] = []

  for (const collection of data.collections) {
    // Use only the first mode (default)
    const mode = collection.modes[0]
    if (!mode) continue

    for (const variable of mode.variables) {
      // Skip aliases (resolved values are preferred)
      if (variable.isAlias) continue

      const type = variable.type?.toLowerCase() || 'string'
      let figmaValue: string | null = null

      if (type === 'color' && variable.value && typeof variable.value === 'object' && 'r' in variable.value) {
        figmaValue = rgbaToHex(variable.value)
      } else if (type === 'number' && typeof variable.value === 'number') {
        figmaValue = String(Math.round(variable.value * 100) / 100)
      } else if (type === 'string' && typeof variable.value === 'string') {
        figmaValue = variable.value
      } else if (type === 'boolean') {
        continue // Skip booleans
      } else if (variable.value !== undefined && variable.value !== null) {
        figmaValue = String(variable.value)
      }

      if (!figmaValue) continue

      const category = detectCategory(variable.name, type, variable.value)
      const prefix = categoryToPrefix(category)
      const name = normalizeName(variable.name, prefix)

      tokens.push({
        name,
        category,
        figmaValue,
        nodeId: `import:${collection.name}:${variable.name}`,
        styleType: `VARIABLE_${type.toUpperCase()}`,
      })
    }
  }

  return tokens
}

// ─── W3C DTCG parser ────────────────────────────────────

function parseDTCG(data: any, path: string[] = []): ParsedToken[] {
  const tokens: ParsedToken[] = []

  for (const [key, val] of Object.entries(data)) {
    if (key.startsWith('$')) continue // Skip meta keys

    const value = val as any
    if (!value || typeof value !== 'object') continue

    if ('$value' in value) {
      // This is a token
      const type = (value.$type || '').toLowerCase()
      let figmaValue: string | null = null

      if (type === 'color') {
        if (typeof value.$value === 'string') {
          figmaValue = value.$value.toUpperCase()
        } else if (typeof value.$value === 'object' && 'r' in value.$value) {
          figmaValue = rgbaToHex(value.$value)
        }
      } else if (type === 'dimension' || type === 'number') {
        if (typeof value.$value === 'object' && 'value' in value.$value) {
          figmaValue = `${value.$value.value}${value.$value.unit || ''}`
        } else if (typeof value.$value === 'number') {
          figmaValue = String(value.$value)
        } else if (typeof value.$value === 'string') {
          figmaValue = value.$value
        }
      } else if (type === 'fontFamily' || type === 'fontWeight' || type === 'string') {
        figmaValue = String(value.$value)
      } else if (typeof value.$value === 'string' || typeof value.$value === 'number') {
        figmaValue = String(value.$value)
      }

      if (!figmaValue) continue

      const fullPath = [...path, key].join('/')
      const category = detectCategory(fullPath, type, value.$value)
      const prefix = categoryToPrefix(category)
      const name = normalizeName(fullPath, prefix)

      tokens.push({
        name,
        category,
        figmaValue,
        nodeId: `import:dtcg:${fullPath}`,
        styleType: `VARIABLE_${type.toUpperCase() || 'STRING'}`,
      })
    } else {
      // This is a group — recurse
      tokens.push(...parseDTCG(value, [...path, key]))
    }
  }

  return tokens
}

// ─── Flat format parser ─────────────────────────────────

function parseFlat(data: Record<string, string | number>): ParsedToken[] {
  const tokens: ParsedToken[] = []

  for (const [key, value] of Object.entries(data)) {
    const strValue = String(value)
    const isColor = isColorString(strValue)
    const type = isColor ? 'color' : (typeof value === 'number' ? 'number' : 'string')
    const category = detectCategory(key, type, value)
    const prefix = categoryToPrefix(category)
    const name = normalizeName(key, prefix)

    tokens.push({
      name,
      category,
      figmaValue: isColor ? strValue.toUpperCase() : strValue,
      nodeId: `import:flat:${key}`,
      styleType: `VARIABLE_${type.toUpperCase()}`,
    })
  }

  return tokens
}

// ─── Main export ────────────────────────────────────────

export function parseImportedVariables(jsonString: string): { tokens: ParsedToken[]; format: string; error?: string } {
  let data: any
  try {
    data = JSON.parse(jsonString)
  } catch {
    return { tokens: [], format: 'invalid', error: 'Invalid JSON' }
  }

  const format = detectFormat(data)

  switch (format) {
    case 'variables2json':
      return { tokens: parseV2J(data), format: 'variables2json' }
    case 'dtcg':
      return { tokens: parseDTCG(data), format: 'W3C DTCG' }
    case 'flat':
      return { tokens: parseFlat(data), format: 'flat key-value' }
    default:
      return { tokens: [], format: 'unknown', error: 'Unrecognized JSON format. Use variables2json plugin or W3C DTCG format.' }
  }
}
