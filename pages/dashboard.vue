<template>
  <div :style="{ background: 'white', display: 'flex', flexDirection: 'column', minHeight: '100vh' }">

    <!-- 1. Header -->
    <div :style="{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', height: '56px', flexShrink: 0 }">
      <div :style="{ display: 'flex', gap: '4px', alignItems: 'center', whiteSpace: 'nowrap' }">
        <span :style="{ fontSize: '13px', fontWeight: 500, color: '#1a1a1a' }">Dashboard</span>
        <span :style="{ fontSize: '11px', color: '#d4d4d8' }">&middot;</span>
        <span :style="{ fontSize: '11px', color: '#999' }">Source of truth: Figma</span>
      </div>
      <div :style="{ display: 'flex', alignItems: 'center', gap: '14px' }">
        <!-- Last sync -->
        <div :style="{ display: 'flex', alignItems: 'center', gap: '6px' }">
          <div :style="{ width: '6px', height: '6px', borderRadius: '99px', background: '#22c55e', flexShrink: 0 }" />
          <span :style="{ fontSize: '11px', fontWeight: 500, color: '#999' }">Last sync 2h ago</span>
        </div>
        <!-- Alerts -->
        <div class="header-btn" :style="{ position: 'relative' }">
          <Bell :size="14" :stroke-width="2" />
          <div :style="{ position: 'absolute', top: '-2px', right: '-2px', width: '14px', height: '14px', borderRadius: '99px', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }">
            <span :style="{ fontSize: '8px', fontWeight: 700, color: 'white' }">3</span>
          </div>
        </div>
        <!-- Avatar -->
        <div :style="{ width: '28px', height: '28px', borderRadius: '99px', background: '#f4f4f5', border: '1px solid #e4e4e7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }">
          <span :style="{ fontSize: '11px', fontWeight: 600, color: '#52525b' }">DS</span>
        </div>
      </div>
    </div>

    <!-- 2. Score + Categories -->
    <div :style="{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 48px', gap: '24px' }">
      <!-- Donut Score -->
      <div :style="{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', flexShrink: 0 }">
        <!-- Ring -->
        <div :style="{ position: 'relative', width: '140px', height: '140px' }">
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="58" fill="none" stroke="#f0f0f0" stroke-width="11" />
            <circle cx="70" cy="70" r="58" fill="none" :stroke="ringColor" stroke-width="11"
              stroke-linecap="round"
              :stroke-dasharray="`${healthScore.score * 3.644} ${364.4 - healthScore.score * 3.644}`"
              :style="{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }" />
          </svg>
          <div :style="{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }">
            <span :style="{ fontFamily: 'Geist Mono, SF Mono, Menlo, monospace', fontSize: '38px', fontWeight: 800, color: '#1a1a1a', letterSpacing: '-1px' }">{{ healthScore.score }}</span>
          </div>
        </div>
        <!-- Label + Status keyword -->
        <div :style="{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }">
          <div :style="{ display: 'flex', alignItems: 'center', gap: '8px' }">
            <span :style="{ fontSize: '15px', fontWeight: 700, color: '#1a1a1a' }">Health Score</span>
            <span :style="{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '99px', background: scoreKeyword.bg, color: scoreKeyword.color }">{{ scoreKeyword.label }}</span>
          </div>
          <span :style="{ fontSize: '12px', fontWeight: 400, color: '#999', textAlign: 'center', maxWidth: '280px', lineHeight: '17px' }">{{ scoreDescription }}</span>
          <div :style="{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '2px' }">
            <div v-for="stat in scoreStats" :key="stat.label" :style="{ display: 'flex', gap: '4px', alignItems: 'center' }">
              <div :style="{ width: '7px', height: '7px', borderRadius: '99px', background: stat.color, flexShrink: 0 }" />
              <span :style="{ fontSize: '11px', fontWeight: 500, color: '#666' }">{{ stat.label }} {{ stat.value }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Categories row -->
      <div :style="{ display: 'flex', gap: '24px' }">
        <div
          v-for="cat in categories"
          :key="cat.name"
          class="metric-cell"
        >
          <span class="metric-label">{{ cat.name }}</span>
          <div :style="{ display: 'flex', alignItems: 'center', gap: '6px' }">
            <span class="metric-value">{{ cat.count }}</span>
            <div :style="{ width: '7px', height: '7px', borderRadius: '99px', background: catDotColor(cat), flexShrink: 0 }" />
          </div>
          <span v-if="cat.delta !== 0" :style="{ fontSize: '11px', fontWeight: 500, color: cat.delta > 0 ? '#22c55e' : '#ef4444', lineHeight: '1' }">{{ cat.delta > 0 ? '+' : '' }}{{ cat.delta }}%</span>
          <span v-else :style="{ fontSize: '11px', fontWeight: 500, color: '#a1a1aa', lineHeight: '1' }">0%</span>
        </div>
      </div>
    </div>

    <!-- 3. Bottom Section: Recently Updated + Linear Tickets -->
    <div :style="{ display: 'flex', gap: '16px', padding: '20px 28px', background: 'white', flex: 1 }">

      <!-- Recently Updated Card -->
      <div :style="{ flex: 1 }">
        <div :style="{ border: '1px solid #e4e4e7', borderRadius: '14px', overflow: 'hidden' }">
          <div :style="{ display: 'flex', alignItems: 'center', gap: '4px', padding: '18px 20px', background: 'white', borderBottom: '1px solid #f0f0f0' }">
            <div :style="{ flex: 1 }">
              <span :style="{ fontSize: '14px', fontWeight: 600, lineHeight: '24px', color: '#1a1a1a' }">Recently updated</span>
            </div>
            <span class="card-link">View all →</span>
          </div>
          <div
            v-for="(item, i) in recentUpdates"
            :key="item.name + i"
            class="list-row"
            :style="{
              borderTop: i > 0 ? '1px solid #f4f4f5' : 'none',
            }"
          >
            <span :style="{ fontSize: '13px', fontWeight: 600, lineHeight: '19.5px', width: '80px', flexShrink: 0, color: '#1a1a1a', whiteSpace: 'nowrap' }">{{ item.name }}</span>
            <span :style="{ fontSize: '12px', fontWeight: 400, lineHeight: '18px', color: '#666', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }">{{ item.change }}</span>
            <div :style="{ width: '10px', height: '10px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }">
              <template v-if="item.by === 'figma'">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 3.33L5 6.67L8.33 6.67L8.33 3.33L5 3.33Z" fill="#A1A1AA" opacity="0.8"/><path d="M1.67 0L1.67 3.33L5 3.33L5 0L1.67 0Z" fill="#A1A1AA" opacity="0.6"/><path d="M1.67 6.67L1.67 3.33L5 3.33L5 6.67L1.67 6.67Z" fill="#A1A1AA" opacity="0.5"/></svg>
              </template>
              <template v-else-if="item.by === 'code'">
                <GitBranch :size="10" :style="{ color: '#a1a1aa' }" />
              </template>
              <template v-else>
                <Check :size="10" :style="{ color: '#a1a1aa' }" />
              </template>
            </div>
            <span :style="{ fontSize: '11px', fontWeight: 400, lineHeight: '16.5px', color: '#a1a1aa', flexShrink: 0, whiteSpace: 'nowrap' }">{{ item.time }}</span>
          </div>
        </div>
      </div>

      <!-- Linear Tickets Card -->
      <div :style="{ flex: 1 }">
        <div :style="{ border: '1px solid #e4e4e7', borderRadius: '14px', overflow: 'hidden' }">
          <div :style="{ display: 'flex', alignItems: 'center', gap: '4px', padding: '18px 20px', background: 'white', borderBottom: '1px solid #f0f0f0' }">
            <div :style="{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }">
              <div :style="{ display: 'flex', alignItems: 'center', gap: '6px' }">
                <div :style="{ display: 'flex', alignItems: 'center', gap: '4px' }">
                  <svg width="18" height="18" viewBox="0 0 100 100" fill="none">
                    <path d="M2.22 55.27a49.48 49.48 0 0 0 42.51 42.51L2.22 55.27Z" fill="#5E6AD2"/>
                    <path d="M0.46 46.21A50.05 50.05 0 0 0 1.3 50.7l48 48a50.07 50.07 0 0 0 4.5.84L0.46 46.21Z" fill="#5E6AD2"/>
                    <path d="M56.21 99.93a49.76 49.76 0 0 0 7.11-1.94L6.01 40.68a49.76 49.76 0 0 0-1.94 7.11l52.14 52.14Z" fill="#5E6AD2"/>
                    <path d="M66.6 96.68a49.87 49.87 0 0 0 5.96-3.67L10.99 27.44a49.87 49.87 0 0 0-3.67 5.96L66.6 96.68Z" fill="#5E6AD2"/>
                    <path d="M76.08 90.63a49.96 49.96 0 0 0 4.59-4.59L18.96 24.33a49.96 49.96 0 0 0-4.59 4.59l61.71 61.71Z" fill="#5E6AD2"/>
                    <path d="M83.94 83.01a49.87 49.87 0 0 0 3.67-5.96L30.3 19.74a49.87 49.87 0 0 0-5.96 3.67l59.6 59.6Z" fill="#5E6AD2"/>
                    <path d="M89.32 73.32a49.76 49.76 0 0 0 1.94-7.11L37.12 12.07a49.76 49.76 0 0 0-7.11 1.94l59.31 59.31Z" fill="#5E6AD2"/>
                    <path d="M93.01 62.73a50.07 50.07 0 0 0 .84-4.5l-48-48a50.07 50.07 0 0 0-4.5-.84l51.66 53.34Z" fill="#5E6AD2"/>
                    <path d="M95.29 50.7a49.48 49.48 0 0 0-42.51-42.51L95.29 50.7Z" fill="#5E6AD2"/>
                  </svg>
                  <span :style="{ fontSize: '14px', fontWeight: 600, lineHeight: '24px', color: '#1a1a1a' }">Linear tickets</span>
                </div>
                <div :style="{ background: '#f0f0f0', borderRadius: '6px', height: '20px', padding: '0 6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }">
                  <span :style="{ fontSize: '12px', fontWeight: 600, lineHeight: '18px', color: '#666' }">{{ linearTickets.length }}</span>
                </div>
              </div>
            </div>
            <span class="card-link">Open Linear →</span>
          </div>
          <div
            v-for="(ticket, i) in linearTickets"
            :key="ticket.id"
            class="list-row"
            :style="{
              borderTop: i > 0 ? '1px solid #f4f4f5' : 'none',
              opacity: ticket.status === 'done' ? 0.5 : 1,
            }"
          >
            <span class="font-mono" :style="{ fontSize: '11px', fontWeight: 400, lineHeight: '16.5px', color: '#999', width: '56px', flexShrink: 0, whiteSpace: 'nowrap' }">{{ ticket.id }}</span>
            <span :style="{
              fontSize: '13px',
              fontWeight: 400,
              lineHeight: '19.5px',
              color: ticket.status === 'done' ? '#999' : '#1a1a1a',
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              textDecoration: ticket.status === 'done' ? 'line-through' : 'none',
            }">{{ ticket.title }}</span>
            <div :style="{ width: '4px', height: '12px', borderRadius: '2px', background: priorityColor(ticket.priority), flexShrink: 0 }" />
            <div :style="avatarStyle(ticket.assignee)">
              <span v-if="ticket.assignee !== '—'" :style="{ fontSize: '9px', fontWeight: 600, lineHeight: '13.5px', color: '#3f3f46' }">{{ ticket.assignee }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { TrendingUp, Palette, Square, Type, Sun, Box, Layers, GitBranch, Check, Bell } from 'lucide-vue-next'

const { healthScore, categories, recentUpdates, linearTickets } = useMockData()

const scoreStats = computed(() => [
  { label: 'Synced', value: healthScore.synced, color: '#22c55e' },
  { label: 'Drifted', value: healthScore.drifted, color: '#d97706' },
  { label: 'Missing', value: healthScore.missing, color: '#dc2626' },
])

const scoreKeyword = computed(() => {
  if (healthScore.score >= 80) return { label: 'Excellent', bg: '#dcfce7', color: '#15803d' }
  if (healthScore.score >= 60) return { label: 'Good', bg: '#fef9c3', color: '#a16207' }
  if (healthScore.score >= 40) return { label: 'At Risk', bg: '#ffedd5', color: '#c2410c' }
  return { label: 'Critical', bg: '#fee2e2', color: '#dc2626' }
})

const scoreDescription = computed(() => {
  if (healthScore.score >= 80) return 'Your design system is well synced. Most tokens match between Figma and code.'
  if (healthScore.score >= 60) return 'Some tokens have drifted or are missing. Review the categories below to identify gaps.'
  if (healthScore.score >= 40) return 'Significant drift detected between your design system and codebase. Action recommended.'
  return 'Your design system is largely out of sync. Immediate attention needed to restore parity.'
})

const ringColor = computed(() => {
  if (healthScore.score >= 70) return '#22c55e'
  if (healthScore.score >= 40) return '#f59e0b'
  return '#ef4444'
})

function catDotColor(cat: any) {
  if (cat.missing > 0) return '#ef4444'
  if (cat.drifted > 0) return '#f59e0b'
  return '#22c55e'
}

function priorityColor(priority: string) {
  if (priority === 'high') return '#ff3e33'
  if (priority === 'medium') return '#ff9100'
  return '#999'
}

function avatarStyle(assignee: string): Record<string, string> {
  const base: Record<string, string> = {
    width: '24px',
    height: '24px',
    borderRadius: '999px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: '0',
  }
  if (assignee === '—') {
    return { ...base, border: '1px solid #d4d4d8' }
  }
  return { ...base, background: '#f8f8f8', border: '1px solid #e4e4e7' }
}
</script>

<style scoped>
.header-btn {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a1a1aa;
  cursor: pointer;
  transition: all 120ms ease;
}
.header-btn:hover {
  color: #52525b;
  background: #f4f4f5;
}
.metric-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 120ms ease;
}
.metric-cell:hover {
  background: #f9f9fb;
}
.metric-label {
  font-size: 12px;
  font-weight: 500;
  color: #666;
  border-bottom: 1px dashed #d4d4d8;
  padding-bottom: 1px;
  width: fit-content;
}
.metric-value {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.3px;
  color: #1a1a1a;
  line-height: 1.2;
}
.card-link {
  font-size: 11px;
  font-weight: 500;
  line-height: 16.5px;
  color: #a1a1aa;
  cursor: pointer;
  white-space: nowrap;
  transition: color 120ms ease;
}
.card-link:hover {
  color: #52525b;
}
.list-row {
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 10px;
  height: 42px;
  transition: background 100ms ease;
}
.list-row:hover {
  background: #fafafa;
}
</style>
