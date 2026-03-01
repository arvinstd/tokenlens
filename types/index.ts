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
