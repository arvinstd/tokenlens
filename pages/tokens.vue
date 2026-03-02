<template>
  <div>
    <div style="padding: 0 40px">
      <!-- Header -->
      <div style="padding: 40px 0 0">
        <h1 style="font-size: 24px; font-weight: 700; letter-spacing: -0.8px; color: #09090B; margin: 0">
          Tokens
        </h1>
        <p style="font-size: 13px; color: #71717A; margin: 8px 0 0">
          {{ tokens.length }} tokens tracked across Figma and code
        </p>
      </div>

      <!-- Filter tabs -->
      <div class="flex items-center gap-[4px]" style="margin-top: 32px; border-bottom: 1px solid #F0F0F1">
        <button
          v-for="tab in filterTabs"
          :key="tab.key"
          class="filter-tab"
          :class="{ 'filter-tab--active': activeCategory === tab.key }"
          @click="activeCategory = tab.key"
        >
          <span
            v-if="tab.dot"
            style="width: 6px; height: 6px; border-radius: 50%; display: inline-block; margin-right: 4px"
            :style="{ background: tab.dot }"
          />
          {{ tab.label }}
          <span class="font-display" style="margin-left: 2px; opacity: 0.6">{{ tab.count }}</span>
        </button>
      </div>

      <!-- Insight banners (only when "All" and has diff data) -->
      <div
        v-if="activeCategory === 'all' && hasDiff"
        class="grid gap-[8px]"
        style="grid-template-columns: 1fr 1fr 1fr; margin-top: 20px"
      >
        <button
          class="insight-card"
          style="background: #F0FDF4; border: 1px solid #BBF7D0"
          @click="activeStatus = activeStatus === 'synced' ? 'all' : 'synced'"
        >
          <div class="flex items-center gap-[6px]">
            <Check :size="14" color="#16A34A" />
            <span style="font-size: 12px; font-weight: 600; color: #16A34A">
              {{ syncedCount }} synced
            </span>
          </div>
          <span style="font-size: 11px; color: #166534; margin-top: 4px; display: block">
            Values match between Figma and code
          </span>
        </button>
        <button
          class="insight-card"
          style="background: #FFFBEB; border: 1px solid #FDE68A"
          @click="activeStatus = activeStatus === 'drifted' ? 'all' : 'drifted'"
        >
          <div class="flex items-center gap-[6px]">
            <AlertTriangle :size="14" color="#D97706" />
            <span style="font-size: 12px; font-weight: 600; color: #D97706">
              {{ driftedCount }} drifted
            </span>
          </div>
          <span style="font-size: 11px; color: #92400E; margin-top: 4px; display: block">
            Tokens with Figma / code mismatch
          </span>
        </button>
        <button
          class="insight-card"
          style="background: #FEF2F2; border: 1px solid #FECACA"
          @click="activeStatus = activeStatus === 'missing' ? 'all' : 'missing'"
        >
          <div class="flex items-center gap-[6px]">
            <AlertTriangle :size="14" color="#DC2626" />
            <span style="font-size: 12px; font-weight: 600; color: #DC2626">
              {{ missingCount }} missing
            </span>
          </div>
          <span style="font-size: 11px; color: #991B1B; margin-top: 4px; display: block">
            Tokens only in Figma or only in code
          </span>
        </button>
      </div>
      <!-- Old insight banners for mock/Figma-only mode -->
      <div
        v-else-if="activeCategory === 'all' && driftedCount > 0"
        class="grid gap-[8px]"
        style="grid-template-columns: 1fr 1fr; margin-top: 20px"
      >
        <button
          class="insight-card"
          style="background: #FFFBEB; border: 1px solid #FDE68A"
          @click="activeStatus = activeStatus === 'drifted' ? 'all' : 'drifted'"
        >
          <div class="flex items-center gap-[6px]">
            <AlertTriangle :size="14" color="#D97706" />
            <span style="font-size: 12px; font-weight: 600; color: #D97706">
              {{ driftedCount }} drifted
            </span>
          </div>
          <span style="font-size: 11px; color: #92400E; margin-top: 4px; display: block">
            Tokens with Figma / code mismatch
          </span>
        </button>
        <button
          class="insight-card"
          style="background: #F0FDF4; border: 1px solid #BBF7D0"
          @click="activeStatus = activeStatus === 'synced' ? 'all' : 'synced'"
        >
          <div class="flex items-center gap-[6px]">
            <Check :size="14" color="#16A34A" />
            <span style="font-size: 12px; font-weight: 600; color: #16A34A">
              {{ syncedCount }} synced
            </span>
          </div>
          <span style="font-size: 11px; color: #166534; margin-top: 4px; display: block">
            Values match between Figma and code
          </span>
        </button>
      </div>

      <!-- Search -->
      <div style="margin-top: 20px; position: relative">
        <Search :size="14" color="#A1A1AA" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%)" />
        <input
          v-model="search"
          placeholder="Search tokens..."
          class="search-input"
        />
      </div>

      <!-- Status filter pills -->
      <div v-if="activeStatus !== 'all'" class="flex items-center gap-[6px]" style="margin-top: 12px">
        <span style="font-size: 11px; color: #A1A1AA">Showing:</span>
        <button class="active-filter-pill" @click="activeStatus = 'all'">
          <span
            style="width: 6px; height: 6px; border-radius: 50%; display: inline-block"
            :style="{ background: activeStatus === 'synced' ? '#16A34A' : activeStatus === 'drifted' ? '#D97706' : '#DC2626' }"
          />
          {{ activeStatus === 'synced' ? 'Synced' : activeStatus === 'drifted' ? 'Drifted' : 'Missing' }}
          <span style="margin-left: 2px; color: #A1A1AA">&times;</span>
        </button>
      </div>

      <!-- Token table -->
      <div style="margin-top: 16px; border: 1px solid #E4E4E7; border-radius: 12px; overflow: hidden">
        <!-- Header row -->
        <div class="token-header">
          <span class="th" style="flex: 1">Token</span>
          <span class="th" style="width: 140px">Figma</span>
          <span class="th" style="width: 140px">Code</span>
          <span class="th" style="width: 100px; text-align: right">Status</span>
        </div>

        <!-- Rows -->
        <div
          v-for="token in filteredTokens"
          :key="token.name"
          class="token-row"
        >
          <div style="flex: 1; display: flex; align-items: center; gap: 8px; min-width: 0">
            <span
              v-if="token.status !== 'synced'"
              style="width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0"
              :style="{ background: token.status === 'missing_in_code' || token.severity === 'high' ? '#DC2626' : token.status === 'drifted' || token.severity === 'medium' ? '#D97706' : token.status === 'missing_in_figma' ? '#2563EB' : '#A1A1AA' }"
            />
            <span style="font-family: 'SF Mono', monospace; font-size: 12px; font-weight: 500; color: #09090B; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">
              {{ token.name }}
            </span>
          </div>
          <span class="token-val" style="width: 140px">
            <span
              v-if="token.figma.startsWith('#')"
              style="width: 12px; height: 12px; border-radius: 3px; display: inline-block; vertical-align: middle; margin-right: 6px; border: 1px solid rgba(0,0,0,0.06); flex-shrink: 0"
              :style="{ background: token.figma }"
            />
            {{ token.figma }}
          </span>
          <span class="token-val" style="width: 140px" :style="{ color: token.figma !== token.code ? '#D97706' : '#71717A' }">
            <span
              v-if="token.code.startsWith('#')"
              style="width: 12px; height: 12px; border-radius: 3px; display: inline-block; vertical-align: middle; margin-right: 6px; border: 1px solid rgba(0,0,0,0.06); flex-shrink: 0"
              :style="{ background: token.code }"
            />
            {{ token.code }}
          </span>
          <div style="width: 100px; text-align: right">
            <span
              v-if="token.status === 'synced'"
              class="status-pill"
              style="background: #F0FDF4; color: #16A34A; border-color: #BBF7D0"
            >
              Synced
            </span>
            <span
              v-else-if="token.status === 'drifted'"
              class="status-pill"
              style="background: #FFFBEB; color: #D97706; border-color: #FDE68A"
            >
              Drifted
            </span>
            <span
              v-else-if="token.status === 'missing_in_code'"
              class="status-pill"
              style="background: #FEF2F2; color: #DC2626; border-color: #FECACA"
            >
              No code
            </span>
            <span
              v-else-if="token.status === 'missing_in_figma'"
              class="status-pill"
              style="background: #EFF6FF; color: #2563EB; border-color: #BFDBFE"
            >
              No Figma
            </span>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="filteredTokens.length === 0" style="padding: 48px 0; text-align: center">
          <div style="font-size: 13px; color: #A1A1AA">No tokens match your filters</div>
        </div>
      </div>

      <!-- Summary -->
      <div class="flex gap-[16px]" style="margin-top: 16px; padding-bottom: 60px">
        <span style="font-size: 12px; color: #16A34A; display: flex; align-items: center; gap: 4px">
          <span style="width: 6px; height: 6px; border-radius: 50%; background: #16A34A; display: inline-block" />
          {{ filteredStatusCounts.synced }} synced
        </span>
        <span style="font-size: 12px; color: #D97706; display: flex; align-items: center; gap: 4px">
          <span style="width: 6px; height: 6px; border-radius: 50%; background: #D97706; display: inline-block" />
          {{ filteredStatusCounts.drifted }} drifted
        </span>
        <span v-if="hasDiff" style="font-size: 12px; color: #DC2626; display: flex; align-items: center; gap: 4px">
          <span style="width: 6px; height: 6px; border-radius: 50%; background: #DC2626; display: inline-block" />
          {{ filteredStatusCounts.missing }} missing
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search, AlertTriangle, Check } from 'lucide-vue-next'

// Real data sources
const { connection: figmaConn, fetchStatus: fetchFigmaStatus } = useFigmaConnection()
const { connection: ghConn, fetchStatus: fetchGhStatus } = useGitHubConnection()
const figmaTokens = useFigmaTokens()
const { diffs: diffResults, summary: diffSummary, fetchResults: fetchDiffResults } = useTokenDiff()

// Mock data as fallback
const mock = useMockData()

// Fetch real data on mount
onMounted(async () => {
  await Promise.all([fetchFigmaStatus(), fetchGhStatus()])
  if (figmaConn.value.connected) {
    await figmaTokens.fetchTokens()
  }
  // Load diff results if both connected
  if (figmaConn.value.connected && ghConn.value.connected) {
    await fetchDiffResults()
  }
})

// Data mode: diff > figma-only > mock
const hasDiff = computed(() => diffResults.value.length > 0)
const isFigmaOnly = computed(() => figmaConn.value.connected && figmaTokens.tokens.value.length > 0 && !hasDiff.value)

const tokens = computed(() => {
  if (hasDiff.value) {
    return diffResults.value.map(d => ({
      name: d.tokenName,
      figma: d.figmaValue || '—',
      code: d.codeValue || '—',
      category: d.category,
      severity: d.severity || ('low' as const),
      status: d.status,
    }))
  }
  if (isFigmaOnly.value) {
    return figmaTokens.tokens.value.map(t => ({
      name: t.name,
      figma: t.figma_value,
      code: '—',
      category: t.category,
      severity: 'low' as const,
      status: 'synced' as const,
    }))
  }
  return mock.tokens.map(t => ({
    ...t,
    status: t.figma === t.code ? 'synced' : 'drifted',
  }))
})

const categories = computed(() => {
  if (hasDiff.value) {
    const catSet = new Set(diffResults.value.map(d => d.category))
    return Array.from(catSet).map(name => ({
      name,
      icon: '',
      count: diffResults.value.filter(d => d.category === name).length,
      synced: diffResults.value.filter(d => d.category === name && d.status === 'synced').length,
      drifted: diffResults.value.filter(d => d.category === name && d.status === 'drifted').length,
      missing: diffResults.value.filter(d => d.category === name && (d.status === 'missing_in_code' || d.status === 'missing_in_figma')).length,
      score: 0,
      delta: 0,
    }))
  }
  if (isFigmaOnly.value) return figmaTokens.categories.value
  return mock.categories
})

const activeCategory = ref('all')
const activeStatus = ref('all')
const search = ref('')

const statusCounts = computed(() => {
  let synced = 0, drifted = 0, missing = 0
  for (const t of tokens.value) {
    if (t.status === 'synced') synced++
    else if (t.status === 'drifted') drifted++
    else if (t.status === 'missing_in_code' || t.status === 'missing_in_figma') missing++
  }
  return { synced, drifted, missing }
})
const driftedCount = computed(() => statusCounts.value.drifted)
const syncedCount = computed(() => statusCounts.value.synced)
const missingCount = computed(() => statusCounts.value.missing)

const filterTabs = computed(() => [
  { key: 'all', label: 'All', count: tokens.value.length, dot: null },
  ...categories.value.map((c: any) => ({
    key: c.name,
    label: c.name,
    count: tokens.value.filter(t => t.category === c.name).length,
    dot: null,
  })),
])

const filteredTokens = computed(() => {
  let list = [...tokens.value]
  if (activeCategory.value !== 'all') {
    list = list.filter(t => t.category === activeCategory.value)
  }
  if (activeStatus.value === 'synced') {
    list = list.filter(t => t.status === 'synced')
  } else if (activeStatus.value === 'drifted') {
    list = list.filter(t => t.status === 'drifted')
  } else if (activeStatus.value === 'missing') {
    list = list.filter(t => t.status === 'missing_in_code' || t.status === 'missing_in_figma')
  }
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(t => t.name.toLowerCase().includes(q) || t.figma.toLowerCase().includes(q) || t.code.toLowerCase().includes(q))
  }
  return list
})

const filteredStatusCounts = computed(() => {
  let synced = 0, drifted = 0, missing = 0
  for (const t of filteredTokens.value) {
    if (t.status === 'synced') synced++
    else if (t.status === 'drifted') drifted++
    else if (t.status === 'missing_in_code' || t.status === 'missing_in_figma') missing++
  }
  return { synced, drifted, missing }
})
</script>

<style scoped>
.filter-tab {
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 450;
  color: #71717A;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 120ms ease;
  display: inline-flex;
  align-items: center;
}
.filter-tab:hover {
  color: #3F3F46;
}
.filter-tab--active {
  font-weight: 600;
  color: #09090B;
  border-bottom-color: #2C2C2E;
}

.insight-card {
  padding: 14px 16px;
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
  transition: all 120ms ease;
}
.insight-card:hover {
  opacity: 0.85;
}

.search-input {
  width: 100%;
  padding: 9px 12px 9px 34px;
  border: 1px solid #E4E4E7;
  border-radius: 8px;
  font-size: 13px;
  color: #09090B;
  outline: none;
  background: #FFFFFF;
  transition: border-color 120ms ease;
  box-sizing: border-box;
}
.search-input:focus {
  border-color: #2C2C2E;
}

.active-filter-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 500;
  color: #3F3F46;
  background: #F4F4F5;
  border: 1px solid #E4E4E7;
  border-radius: 6px;
  cursor: pointer;
  transition: all 120ms ease;
}
.active-filter-pill:hover {
  border-color: #D4D4D8;
}

.token-header {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  background: #FAFAFA;
  border-bottom: 1px solid #F0F0F1;
}
.th {
  font-size: 10px;
  font-weight: 600;
  color: #A1A1AA;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.token-row {
  display: flex;
  align-items: center;
  padding: 11px 16px;
  border-bottom: 1px solid #F0F0F1;
  transition: background 80ms ease;
}
.token-row:last-child {
  border-bottom: none;
}
.token-row:hover {
  background: #FAFAFA;
}
.token-val {
  font-family: 'SF Mono', monospace;
  font-size: 12px;
  color: #71717A;
  display: flex;
  align-items: center;
}
.status-pill {
  font-size: 10px;
  font-weight: 500;
  padding: 2px 7px;
  border-radius: 20px;
  border: 1px solid;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  white-space: nowrap;
}
</style>
