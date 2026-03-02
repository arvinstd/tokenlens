/**
 * Token diff engine
 * Compares Figma tokens vs Code tokens, computes status + severity
 */

export interface DiffResult {
  tokenName: string
  category: string
  figmaValue: string | null
  codeValue: string | null
  status: 'synced' | 'drifted' | 'missing_in_code' | 'missing_in_figma'
  severity: 'low' | 'medium' | 'high' | null
}

export interface DiffSummary {
  total: number
  synced: number
  drifted: number
  missingInCode: number
  missingInFigma: number
  healthScore: number
}

interface TokenEntry {
  name: string
  category: string
  value: string
}

/** Normalize a token name for matching: lowercase, strip separators */
function normalizeForMatch(name: string): string {
  return name
    .toLowerCase()
    .replace(/[-_]/g, '.')
    .replace(/\.+/g, '.')
    .replace(/^\.+|\.+$/g, '')
}

/** Get suffix variants for fuzzy matching */
function getSuffixes(name: string): string[] {
  const parts = name.split('.')
  const suffixes: string[] = []
  // Generate progressively shorter suffixes
  for (let i = 1; i < parts.length; i++) {
    suffixes.push(parts.slice(i).join('.'))
  }
  return suffixes
}

/** Parse a hex color string into RGB components */
function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '').toUpperCase()
  if (clean.length < 6) return null

  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)

  if (isNaN(r) || isNaN(g) || isNaN(b)) return null
  return { r, g, b }
}

/** Compute RGB Euclidean distance between two hex colors */
function colorDistance(hex1: string, hex2: string): number | null {
  const c1 = parseHex(hex1)
  const c2 = parseHex(hex2)
  if (!c1 || !c2) return null

  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) +
    Math.pow(c1.g - c2.g, 2) +
    Math.pow(c1.b - c2.b, 2)
  )
}

/** Extract numeric value from a string like "16px", "1.5rem", "700" */
function extractNumeric(value: string): number | null {
  const match = value.match(/^([0-9.]+)/)
  if (!match) return null
  const num = parseFloat(match[1])
  return isNaN(num) ? null : num
}

/** Compute severity for a drifted token */
function computeSeverity(
  category: string,
  figmaValue: string,
  codeValue: string
): 'low' | 'medium' | 'high' {
  // Colors: RGB distance
  if (category === 'Colors') {
    const dist = colorDistance(figmaValue, codeValue)
    if (dist !== null) {
      if (dist < 15) return 'low'
      if (dist < 50) return 'medium'
      return 'high'
    }
  }

  // Typography, Spacing, Sizing, Border Radius: numeric % difference
  if (['Typography', 'Spacing', 'Sizing', 'Border Radius'].includes(category)) {
    const figmaNum = extractNumeric(figmaValue)
    const codeNum = extractNumeric(codeValue)
    if (figmaNum !== null && codeNum !== null && figmaNum !== 0) {
      const pctDiff = Math.abs(figmaNum - codeNum) / figmaNum * 100
      if (pctDiff < 5) return 'low'
      if (pctDiff < 20) return 'medium'
      return 'high'
    }
  }

  // Shadows and others: any difference = medium
  return 'medium'
}

/** Normalize a value for comparison (lowercase, trim, strip units where safe) */
function normalizeValue(value: string): string {
  return value.trim().toUpperCase()
}

/**
 * Main diff engine: compare Figma tokens vs Code tokens
 */
export function computeDiffs(
  figmaTokens: TokenEntry[],
  codeTokens: TokenEntry[]
): DiffResult[] {
  const results: DiffResult[] = []

  // Build maps with normalized names
  const figmaMap = new Map<string, TokenEntry>()
  const codeMap = new Map<string, TokenEntry>()

  for (const token of figmaTokens) {
    figmaMap.set(normalizeForMatch(token.name), token)
  }
  for (const token of codeTokens) {
    codeMap.set(normalizeForMatch(token.name), token)
  }

  // Track matched code tokens
  const matchedCodeKeys = new Set<string>()

  // Process Figma tokens
  for (const [figmaKey, figmaToken] of figmaMap) {
    // Try exact match first
    let codeToken = codeMap.get(figmaKey)
    let matchedKey = figmaKey

    // Fuzzy match: try suffix matching
    if (!codeToken) {
      const suffixes = getSuffixes(figmaKey)
      for (const suffix of suffixes) {
        for (const [codeKey, ct] of codeMap) {
          if (codeKey === suffix || codeKey.endsWith(`.${suffix}`)) {
            if (!matchedCodeKeys.has(codeKey)) {
              codeToken = ct
              matchedKey = codeKey
              break
            }
          }
        }
        if (codeToken) break
      }
    }

    // Also try reverse suffix: code token suffix matches figma token
    if (!codeToken) {
      for (const [codeKey, ct] of codeMap) {
        if (matchedCodeKeys.has(codeKey)) continue
        const codeSuffixes = getSuffixes(codeKey)
        for (const suffix of codeSuffixes) {
          if (figmaKey === suffix || figmaKey.endsWith(`.${suffix}`)) {
            codeToken = ct
            matchedKey = codeKey
            break
          }
        }
        if (codeToken) break
      }
    }

    if (codeToken) {
      matchedCodeKeys.add(matchedKey)

      // Compare values
      const figmaVal = normalizeValue(figmaToken.value)
      const codeVal = normalizeValue(codeToken.value)

      if (figmaVal === codeVal) {
        results.push({
          tokenName: figmaToken.name,
          category: figmaToken.category,
          figmaValue: figmaToken.value,
          codeValue: codeToken.value,
          status: 'synced',
          severity: null,
        })
      } else {
        results.push({
          tokenName: figmaToken.name,
          category: figmaToken.category,
          figmaValue: figmaToken.value,
          codeValue: codeToken.value,
          status: 'drifted',
          severity: computeSeverity(figmaToken.category, figmaToken.value, codeToken.value),
        })
      }
    } else {
      // No code match
      results.push({
        tokenName: figmaToken.name,
        category: figmaToken.category,
        figmaValue: figmaToken.value,
        codeValue: null,
        status: 'missing_in_code',
        severity: 'high',
      })
    }
  }

  // Code tokens with no Figma match
  for (const [codeKey, codeToken] of codeMap) {
    if (!matchedCodeKeys.has(codeKey)) {
      results.push({
        tokenName: codeToken.name,
        category: codeToken.category,
        figmaValue: null,
        codeValue: codeToken.value,
        status: 'missing_in_figma',
        severity: 'medium',
      })
    }
  }

  return results
}

/** Compute summary stats from diff results */
export function computeSummary(diffs: DiffResult[]): DiffSummary {
  const total = diffs.length
  let synced = 0, drifted = 0, missingInCode = 0, missingInFigma = 0
  for (const d of diffs) {
    if (d.status === 'synced') synced++
    else if (d.status === 'drifted') drifted++
    else if (d.status === 'missing_in_code') missingInCode++
    else if (d.status === 'missing_in_figma') missingInFigma++
  }
  const healthScore = total > 0 ? Math.round((synced / total) * 100) : 0

  return { total, synced, drifted, missingInCode, missingInFigma, healthScore }
}
