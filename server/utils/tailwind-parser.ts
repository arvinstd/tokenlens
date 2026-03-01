/**
 * Tailwind config parser
 * Parses tailwind.config.ts/js into normalized design tokens
 */

export interface CodeTokenParsed {
  name: string
  category: string
  codeValue: string
}

/** Category mapping from Tailwind theme keys */
const CATEGORY_MAP: Record<string, string> = {
  colors: 'Colors',
  backgroundColor: 'Colors',
  textColor: 'Colors',
  borderColor: 'Colors',
  fontSize: 'Typography',
  fontFamily: 'Typography',
  fontWeight: 'Typography',
  lineHeight: 'Typography',
  letterSpacing: 'Typography',
  spacing: 'Spacing',
  padding: 'Spacing',
  margin: 'Spacing',
  gap: 'Spacing',
  width: 'Sizing',
  height: 'Sizing',
  maxWidth: 'Sizing',
  minWidth: 'Sizing',
  maxHeight: 'Sizing',
  minHeight: 'Sizing',
  borderRadius: 'Border Radius',
  boxShadow: 'Shadows',
  dropShadow: 'Shadows',
  opacity: 'Other',
  zIndex: 'Other',
  screens: 'Breakpoints',
}

/** Prefix mapping from Tailwind keys to token name prefixes */
const PREFIX_MAP: Record<string, string> = {
  colors: 'color',
  backgroundColor: 'color',
  textColor: 'color',
  borderColor: 'color',
  fontSize: 'font.size',
  fontFamily: 'font.family',
  fontWeight: 'font.weight',
  lineHeight: 'line-height',
  letterSpacing: 'letter-spacing',
  spacing: 'spacing',
  padding: 'spacing',
  margin: 'spacing',
  gap: 'spacing',
  width: 'sizing.width',
  height: 'sizing.height',
  maxWidth: 'sizing.max-width',
  minWidth: 'sizing.min-width',
  maxHeight: 'sizing.max-height',
  minHeight: 'sizing.min-height',
  borderRadius: 'border-radius',
  boxShadow: 'shadow',
  dropShadow: 'shadow',
  opacity: 'opacity',
  zIndex: 'z-index',
  screens: 'screen',
}

/**
 * Strip TypeScript/ESM syntax from a Tailwind config to get a parseable JS object
 */
function stripTsAndImports(content: string): string {
  let cleaned = content

  // Remove import statements
  cleaned = cleaned.replace(/^import\s+.*$/gm, '')

  // Remove require statements that are standalone
  cleaned = cleaned.replace(/^const\s+\w+\s*=\s*require\s*\(.*\)\s*;?\s*$/gm, '')

  // Remove type annotations: `: Config`, `satisfies Config`, `as const`
  cleaned = cleaned.replace(/\s*satisfies\s+\w+/g, '')
  cleaned = cleaned.replace(/\s*as\s+const/g, '')
  cleaned = cleaned.replace(/:\s*Config\b/g, '')
  cleaned = cleaned.replace(/:\s*Partial<\w+>/g, '')

  // Remove `export default` / `module.exports =`
  cleaned = cleaned.replace(/export\s+default\s+/, '')
  cleaned = cleaned.replace(/module\.exports\s*=\s*/, '')

  // Remove type imports
  cleaned = cleaned.replace(/^import\s+type\s+.*$/gm, '')

  return cleaned.trim()
}

/**
 * Extract the config object from cleaned content
 * Handles: `{ content: [...], theme: { ... } }` or `defineConfig({ ... })`
 */
function extractConfigObject(content: string): string {
  // Try to find defineConfig wrapper
  const defineMatch = content.match(/defineConfig\s*\(\s*(\{[\s\S]*\})\s*\)\s*;?\s*$/)
  if (defineMatch) {
    return defineMatch[1]
  }

  // Find the outermost { ... }
  const firstBrace = content.indexOf('{')
  if (firstBrace === -1) return '{}'

  let depth = 0
  let lastBrace = -1
  for (let i = firstBrace; i < content.length; i++) {
    if (content[i] === '{') depth++
    if (content[i] === '}') {
      depth--
      if (depth === 0) {
        lastBrace = i
        break
      }
    }
  }

  if (lastBrace === -1) return '{}'
  return content.slice(firstBrace, lastBrace + 1)
}

/**
 * Safely evaluate a JS object string into a real object
 */
function safeEval(objStr: string): Record<string, any> {
  try {
    // Clean common patterns that break eval
    let cleaned = objStr
      // Remove trailing commas before }
      .replace(/,\s*}/g, '}')
      // Remove trailing commas before ]
      .replace(/,\s*]/g, ']')
      // Handle template literals (simplify)
      .replace(/`[^`]*`/g, '""')
      // Handle function calls like `plugin(...)`, `require(...)`
      .replace(/\b(plugin|require|resolveColor|withOpacity)\s*\([^)]*\)/g, '""')
      // Handle spread operators (remove them)
      .replace(/\.\.\.\w+(\([^)]*\))?,?\s*/g, '')
      // Handle arrow functions as values
      .replace(/\(\s*\{[^}]*\}\s*\)\s*=>\s*[^,}]*/g, '""')
      .replace(/\([^)]*\)\s*=>\s*\{[^}]*\}/g, '""')
      .replace(/\([^)]*\)\s*=>\s*[^,}\]]+/g, '""')

    const fn = new Function(`return ${cleaned}`)
    return fn()
  } catch (e) {
    console.warn('[tailwind-parser] Failed to evaluate config:', (e as Error).message)
    return {}
  }
}

/**
 * Flatten a nested object into dot-separated tokens
 */
function flattenObject(
  obj: any,
  prefix: string,
  category: string,
  tokens: CodeTokenParsed[]
): void {
  if (obj === null || obj === undefined) return

  if (typeof obj === 'string' || typeof obj === 'number') {
    tokens.push({
      name: prefix,
      category,
      codeValue: String(obj),
    })
    return
  }

  if (Array.isArray(obj)) {
    tokens.push({
      name: prefix,
      category,
      codeValue: obj.join(', '),
    })
    return
  }

  if (typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) continue
      // DEFAULT key → use parent name
      const tokenName = key === 'DEFAULT' ? prefix : `${prefix}.${key.toLowerCase()}`
      flattenObject(value, tokenName, category, tokens)
    }
  }
}

/**
 * Main parser: takes raw tailwind.config content → array of tokens
 */
export function parseTailwindConfig(rawContent: string): CodeTokenParsed[] {
  const tokens: CodeTokenParsed[] = []

  // 1. Strip TS/ESM syntax
  const stripped = stripTsAndImports(rawContent)

  // 2. Extract config object string
  const objStr = extractConfigObject(stripped)

  // 3. Evaluate to real JS object
  const config = safeEval(objStr)

  if (!config || typeof config !== 'object') {
    console.warn('[tailwind-parser] Could not parse config object')
    return tokens
  }

  // 4. Extract tokens from theme.extend and theme
  const themeExtend = config.theme?.extend || {}
  const theme = config.theme || {}

  // Process theme.extend first (overrides), then theme (base)
  const processedKeys = new Set<string>()

  for (const source of [themeExtend, theme]) {
    for (const [key, value] of Object.entries(source)) {
      if (key === 'extend') continue // skip nested extend ref
      if (processedKeys.has(key)) continue // extend takes priority

      const category = CATEGORY_MAP[key]
      const prefix = PREFIX_MAP[key]

      if (!category || !prefix) continue // skip unknown keys

      processedKeys.add(key)

      if (typeof value === 'object' && value !== null) {
        flattenObject(value, prefix, category, tokens)
      }
    }
  }

  console.log(`[tailwind-parser] Parsed ${tokens.length} tokens from config`)
  return tokens
}
