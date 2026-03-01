/**
 * Figma REST API client
 * Thin wrapper with retry logic for rate limiting
 */

const FIGMA_API = 'https://api.figma.com/v1'

interface FigmaRequestOptions {
  pat: string
  retries?: number
}

async function figmaFetch<T>(path: string, { pat, retries = 2 }: FigmaRequestOptions): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await $fetch(`${FIGMA_API}${path}`, {
        headers: { 'X-Figma-Token': pat },
      })
      return result as T
    } catch (error: any) {
      // Rate limited — wait and retry
      if (error?.status === 429 && attempt < retries) {
        const wait = Math.pow(2, attempt + 1) * 1000 // 2s, 4s
        await new Promise(resolve => setTimeout(resolve, wait))
        continue
      }
      throw error
    }
  }
  throw new Error('Figma API request failed after retries')
}

/** Get file metadata (name, lastModified, etc.) */
export async function getFile(pat: string, fileKey: string) {
  return figmaFetch<{
    name: string
    lastModified: string
    version: string
    document: any
    components: Record<string, any>
    styles: Record<string, { key: string; name: string; styleType: string; description: string }>
  }>(`/files/${fileKey}?depth=1`, { pat })
}

/** Get published styles for a file */
export async function getFileStyles(pat: string, fileKey: string) {
  return figmaFetch<{
    status: number
    error: boolean
    meta: {
      styles: Array<{
        key: string
        file_key: string
        node_id: string
        style_type: 'FILL' | 'TEXT' | 'EFFECT' | 'GRID'
        name: string
        description: string
        created_at: string
        updated_at: string
      }>
    }
  }>(`/files/${fileKey}/styles`, { pat })
}

/** Get specific nodes by ID */
export async function getNodes(pat: string, fileKey: string, nodeIds: string[]) {
  const ids = nodeIds.join(',')
  return figmaFetch<{
    nodes: Record<string, {
      document: any
      components: Record<string, any>
      styles: Record<string, any>
    }>
  }>(`/files/${fileKey}/nodes?ids=${encodeURIComponent(ids)}`, { pat })
}

/** Get published components for a file */
export async function getFileComponents(pat: string, fileKey: string) {
  return figmaFetch<{
    status: number
    error: boolean
    meta: {
      components: Array<{
        key: string
        file_key: string
        node_id: string
        name: string
        description: string
        created_at: string
        updated_at: string
        containing_frame?: { name: string; nodeId: string; pageName: string }
        containing_component_set?: { name: string; nodeId: string } | null
      }>
    }
  }>(`/files/${fileKey}/components`, { pat })
}

/** Get images/thumbnails for specific nodes */
export async function getImages(pat: string, fileKey: string, nodeIds: string[]) {
  const ids = nodeIds.join(',')
  return figmaFetch<{
    err: null | string
    images: Record<string, string | null>
  }>(`/images/${fileKey}?ids=${encodeURIComponent(ids)}&format=png&scale=2`, { pat })
}

/** Get local variables for a file */
export async function getLocalVariables(pat: string, fileKey: string) {
  return figmaFetch<{
    status: number
    error: boolean
    meta: {
      variableCollections: Record<string, {
        id: string
        name: string
        modes: Array<{ modeId: string; name: string }>
        defaultModeId: string
        variableIds: string[]
      }>
      variables: Record<string, {
        id: string
        name: string
        resolvedType: 'COLOR' | 'FLOAT' | 'STRING' | 'BOOLEAN'
        valuesByMode: Record<string, any>
        scopes: string[]
        codeSyntax?: { WEB?: string }
      }>
    }
  }>(`/files/${fileKey}/variables/local`, { pat })
}

/** Validate a PAT by fetching /me */
export async function validatePat(pat: string) {
  return figmaFetch<{ id: string; email: string; handle: string }>('/me', { pat })
}
