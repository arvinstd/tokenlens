export type TrendDirection = 'up' | 'down' | 'same'
export type TokenStatus = 'synced' | 'drifted' | 'missing' | 'orphan'
export type Severity = 'low' | 'medium' | 'high'

export interface Category {
  name: string
  icon: string
  count: number
  synced: number
  drifted: number
  missing: number
  score: number
  delta: number
}

export interface DriftedToken {
  name: string
  figma: string
  code: string
  category: string
  severity: Severity
}

export interface TokenHistory {
  date: string
  event: string
  from: string | null
  to: string | null
}

export interface HealthScore {
  score: number
  change: number
  totalTokens: number
  synced: number
  drifted: number
  missing: number
}

export type ComponentStatus = 'synced' | 'drifted' | 'missing'

export interface ComponentProp {
  name: string
  type: string
  default: string
  required: boolean
}

export interface LibraryComponent {
  description: string
  status: ComponentStatus
  figmaDate: string
  codeDate: string
  figmaVariants: number
  codeVariants: number
  behind?: 'code' | 'figma'
  behindDetail?: string
  props: ComponentProp[]
  code: string
  usage: string
}

export interface RecentUpdate {
  name: string
  by: 'figma' | 'code' | 'both'
  time: string
  change: string
  status: ComponentStatus
}

export interface LinearTicket {
  id: string
  title: string
  status: 'todo' | 'progress' | 'done'
  assignee: string
  priority: 'high' | 'medium' | 'low'
  component: string
}

// Figma component from DB
export interface FigmaComponent {
  id: string
  name: string
  description: string
  figma_node_id: string
  component_set_name?: string
  variant_count: number
  page_name?: string
  synced_at?: string
}

// Figma API types
export interface FigmaConnection {
  connected: boolean
  fileKey?: string
  fileName?: string
  lastSynced?: string
  tokenCount?: number
}

export interface FigmaToken {
  id: string
  name: string
  category: string
  figma_value: string
  node_id?: string
  style_type?: string
  synced_at?: string
}

// GitHub API types
export interface GitHubConnection {
  connected: boolean
  repoOwner?: string
  repoName?: string
  configPath?: string
  lastSynced?: string
  tokenCount?: number
}

export interface CodeToken {
  id: string
  name: string
  category: string
  code_value: string
  source_file?: string
  synced_at?: string
}

// Diff types
export interface TokenDiff {
  id?: string
  tokenName: string
  category: string
  figmaValue: string | null
  codeValue: string | null
  status: 'synced' | 'drifted' | 'missing_in_code' | 'missing_in_figma'
  severity: 'low' | 'medium' | 'high' | null
}

export interface DiffSummaryData {
  total: number
  synced: number
  drifted: number
  missingInCode: number
  missingInFigma: number
  healthScore: number
}

// User preferences
export interface UserPreferences {
  sourceOfTruth: 'figma' | 'code'
  onboardingCompleted: boolean
}
