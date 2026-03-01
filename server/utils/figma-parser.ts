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
