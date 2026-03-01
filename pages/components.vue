<template>
  <div style="overflow-x: hidden; max-width: 100%">
    <div style="padding: 0 40px; overflow: hidden">

      <!-- LIST VIEW -->
      <template v-if="!selected">
        <!-- Header -->
        <div style="padding: 40px 0 0">
          <div style="display: flex; align-items: center; justify-content: space-between">
            <div>
              <h1 style="font-size: 24px; font-weight: 700; letter-spacing: -0.8px; color: #09090B; margin: 0">
                Components
              </h1>
              <p style="font-size: 13px; color: #71717A; margin: 8px 0 0">
                {{ componentCount }} components &middot; Figma &harr; Code sync status
              </p>
            </div>
            <!-- Grid/List toggle -->
            <div style="display: flex; background: #f4f4f5; border-radius: 8px; padding: 2px">
              <button
                class="view-toggle"
                :class="{ 'view-toggle--active': viewMode === 'grid' }"
                @click="viewMode = 'grid'"
              >
                <LayoutGrid :size="14" />
              </button>
              <button
                class="view-toggle"
                :class="{ 'view-toggle--active': viewMode === 'list' }"
                @click="viewMode = 'list'"
              >
                <List :size="14" />
              </button>
            </div>
          </div>
        </div>

        <!-- Filter tabs -->
        <div style="display: flex; align-items: center; gap: 4px; margin-top: 32px; border-bottom: 1px solid #F0F0F1">
          <button
            v-for="tab in filterTabs"
            :key="tab.key"
            class="filter-tab"
            :class="{ 'filter-tab--active': activeFilter === tab.key }"
            @click="activeFilter = tab.key"
          >
            <span
              v-if="tab.dot"
              style="width: 6px; height: 6px; border-radius: 50%; display: inline-block; margin-right: 4px"
              :style="{ background: tab.dot }"
            />
            {{ tab.label }}
            <span style="margin-left: 2px; opacity: 0.6; font-variant-numeric: tabular-nums">{{ tab.count }}</span>
          </button>
        </div>

        <!-- Insight banners (only when "all") -->
        <div
          v-if="activeFilter === 'all'"
          style="display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 8px; margin-top: 20px"
        >
          <button
            class="insight-card"
            style="background: #FFFBEB; border: 1px solid #FDE68A"
            @click="activeFilter = 'drifted'"
          >
            <div style="display: flex; align-items: center; gap: 6px">
              <AlertTriangle :size="14" color="#D97706" />
              <span style="font-size: 12px; font-weight: 600; color: #D97706">
                {{ driftedCount }} outdated
              </span>
            </div>
            <span style="font-size: 11px; color: #92400E; margin-top: 4px; display: block">
              Components with Figma / code drift
            </span>
          </button>
          <button
            class="insight-card"
            style="background: #FEF2F2; border: 1px solid #FECACA"
            @click="activeFilter = 'missing'"
          >
            <div style="display: flex; align-items: center; gap: 6px">
              <AlertTriangle :size="14" color="#DC2626" />
              <span style="font-size: 12px; font-weight: 600; color: #DC2626">
                {{ missingCount }} missing
              </span>
            </div>
            <span style="font-size: 11px; color: #991B1B; margin-top: 4px; display: block">
              In Figma but not yet implemented
            </span>
          </button>
        </div>

        <!-- GRID VIEW -->
        <div
          v-if="viewMode === 'grid'"
          style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-top: 20px; padding-bottom: 60px"
        >
          <div
            v-for="(comp, name) in filteredComponents"
            :key="name"
            class="comp-card"
            @click="selectComponent(name as string)"
          >
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px">
              <span style="font-size: 14px; font-weight: 600; color: #09090B">{{ name }}</span>
              <span :class="['status-pill', 'status-pill--' + comp.status]">
                <Check v-if="comp.status === 'synced'" :size="10" />
                {{ statusLabel(comp.status) }}
              </span>
            </div>
            <p style="font-size: 11px; color: #A1A1AA; margin: 8px 0 0; line-height: 1.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%">
              {{ comp.description }}
            </p>
            <div style="font-size: 11px; color: #A1A1AA; margin-top: 10px; font-variant-numeric: tabular-nums">
              <span style="font-weight: 600">{{ comp.figmaVariants }}</span> Figma
              <span style="margin: 0 4px; color: #E4E4E7">&middot;</span>
              <span style="font-weight: 600">{{ comp.codeVariants }}</span> Code
            </div>
          </div>
        </div>

        <!-- LIST VIEW -->
        <div
          v-else
          style="margin-top: 20px; padding-bottom: 60px; border: 1px solid #e4e4e7; border-radius: 10px; overflow: hidden"
        >
          <div
            v-for="(comp, name, i) in filteredComponents"
            :key="name"
            class="list-row"
            :style="{ borderTop: i > 0 ? '1px solid #f4f4f5' : 'none' }"
            @click="selectComponent(name as string)"
          >
            <span style="font-size: 13px; font-weight: 600; color: #09090B; width: 100px; flex-shrink: 0">{{ name }}</span>
            <span style="font-size: 12px; color: #A1A1AA; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">{{ comp.description }}</span>
            <div style="display: flex; align-items: center; gap: 12px; flex-shrink: 0">
              <span style="font-size: 11px; color: #a1a1aa; font-variant-numeric: tabular-nums">
                <span style="font-weight: 600">{{ comp.figmaVariants }}</span> F
                <span style="margin: 0 2px; color: #e4e4e7">/</span>
                <span style="font-weight: 600">{{ comp.codeVariants }}</span> C
              </span>
              <span :class="['status-pill', 'status-pill--' + comp.status]">
                <Check v-if="comp.status === 'synced'" :size="10" />
                {{ statusLabel(comp.status) }}
              </span>
            </div>
          </div>
        </div>
      </template>

      <!-- DETAIL VIEW -->
      <template v-else>
        <!-- Back button -->
        <button class="back-btn" @click="selected = null">
          <ChevronLeft :size="12" />
          Components
        </button>

        <!-- Header -->
        <div style="padding-top: 8px">
          <div style="display: flex; align-items: center; gap: 10px">
            <h1 style="font-size: 24px; font-weight: 700; letter-spacing: -0.8px; color: #09090B; margin: 0">
              {{ selected }}
            </h1>
            <span :class="['detail-badge', 'detail-badge--' + selectedComp.status]">
              {{ detailBadgeLabel }}
            </span>
          </div>
          <p style="font-size: 13px; color: #71717A; margin: 8px 0 0; max-width: 500px; line-height: 1.5">
            {{ selectedComp.description }}
          </p>
          <div style="display: flex; gap: 16px; margin-top: 12px">
            <span style="display: flex; align-items: center; gap: 3px; font-size: 11px; color: #A1A1AA">
              <svg width="14" height="14" viewBox="0 0 38 57" fill="none" style="display: inline-block; vertical-align: -2px"><path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" fill="#1ABCFE"/><path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z" fill="#0ACF83"/><path d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z" fill="#FF7262"/><path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" fill="#F24E1E"/><path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" fill="#A259FF"/></svg>
              Figma: {{ selectedComp.figmaVariants }} variants &middot; {{ selectedComp.figmaDate }}
            </span>
            <span style="display: flex; align-items: center; gap: 3px; font-size: 11px; color: #A1A1AA">
              <Code2 :size="11" />
              Code: {{ selectedComp.codeVariants }} variants &middot; {{ selectedComp.codeDate }}
            </span>
          </div>
        </div>

        <!-- Detail tabs -->
        <div style="display: flex; align-items: center; gap: 4px; margin-top: 40px; border-bottom: 1px solid #F0F0F1">
          <button
            v-for="tab in detailTabs"
            :key="tab.key"
            class="detail-tab"
            :class="{ 'detail-tab--active': activeDetailTab === tab.key }"
            @click="activeDetailTab = tab.key"
          >
            <component :is="tab.icon" :size="13" style="margin-right: 4px; vertical-align: -1px" />
            {{ tab.label }}
          </button>
        </div>

        <!-- Preview Tab -->
        <div v-if="activeDetailTab === 'preview'" style="padding: 28px 0 0">
          <!-- Button preview -->
          <div v-if="selected === 'Button'" class="preview-container">
            <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 10px">
              <button class="prev-btn prev-btn--primary">Primary</button>
              <button class="prev-btn prev-btn--secondary">Secondary</button>
              <button class="prev-btn prev-btn--ghost">Ghost</button>
              <button class="prev-btn prev-btn--danger">Danger</button>
              <button class="prev-btn prev-btn--primary prev-btn--sm">Small</button>
              <button class="prev-btn prev-btn--primary prev-btn--lg">Large</button>
            </div>
          </div>

          <!-- Badge preview -->
          <div v-else-if="selected === 'Badge'" class="preview-container">
            <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px">
              <span class="prev-badge prev-badge--default">Default</span>
              <span class="prev-badge prev-badge--success">Success</span>
              <span class="prev-badge prev-badge--warning">Warning</span>
              <span class="prev-badge prev-badge--error">Error</span>
              <span class="prev-badge prev-badge--brand">Brand</span>
            </div>
          </div>

          <!-- Input preview -->
          <div v-else-if="selected === 'Input'" class="preview-container">
            <div style="display: flex; flex-direction: column; gap: 14px; max-width: 320px">
              <div class="prev-input-group">
                <label class="prev-input-label">Email</label>
                <input class="prev-input" placeholder="you@company.com" />
              </div>
              <div class="prev-input-group">
                <label class="prev-input-label">Name</label>
                <input class="prev-input prev-input--error" value="J" />
                <span style="font-size: 11px; color: #DC2626; margin-top: 4px">Minimum 2 characters</span>
              </div>
              <div class="prev-input-group">
                <label class="prev-input-label" style="color: #A1A1AA">Disabled</label>
                <input class="prev-input prev-input--disabled" placeholder="Read only" disabled />
              </div>
            </div>
          </div>

          <!-- Avatar preview -->
          <div v-else-if="selected === 'Avatar'" class="preview-container">
            <div style="display: flex; align-items: flex-end; gap: 12px">
              <div class="prev-avatar" style="width: 32px; height: 32px; font-size: 11px">DS</div>
              <div class="prev-avatar" style="width: 40px; height: 40px; font-size: 13px">DS</div>
              <div class="prev-avatar" style="width: 48px; height: 48px; font-size: 14px">DS</div>
              <div class="prev-avatar" style="width: 56px; height: 56px; font-size: 16px">DS</div>
              <div style="width: 1px; height: 40px; background: #F0F0F1; margin: 0 8px" />
              <div style="display: flex; margin-left: 0">
                <div class="prev-avatar-stack" style="background: #2C2C2E; color: #FFF; z-index: 4">DS</div>
                <div class="prev-avatar-stack" style="background: #7C3AED; color: #FFF; z-index: 3; margin-left: -10px">MK</div>
                <div class="prev-avatar-stack" style="background: #0891B2; color: #FFF; z-index: 2; margin-left: -10px">JL</div>
                <div class="prev-avatar-stack" style="background: #D97706; color: #FFF; z-index: 1; margin-left: -10px">+2</div>
              </div>
            </div>
          </div>

          <!-- Card preview -->
          <div v-else-if="selected === 'Card'" class="preview-container">
            <div style="display: flex; gap: 12px">
              <div class="prev-card prev-card--default">
                <div style="font-size: 13px; font-weight: 600; color: #09090B">Default</div>
                <div style="font-size: 11px; color: #71717A; margin-top: 4px">With shadow</div>
              </div>
              <div class="prev-card prev-card--subtle">
                <div style="font-size: 13px; font-weight: 600; color: #09090B">Subtle</div>
                <div style="font-size: 11px; color: #71717A; margin-top: 4px">Flat, no shadow</div>
              </div>
              <div class="prev-card prev-card--highlighted">
                <div style="font-size: 13px; font-weight: 600; color: #09090B">Highlighted</div>
                <div style="font-size: 11px; color: #71717A; margin-top: 4px">Brand border</div>
              </div>
            </div>
          </div>

          <!-- Tooltip preview -->
          <div v-else-if="selected === 'Tooltip'" class="preview-container">
            <div style="padding-top: 40px; display: flex; justify-content: center">
              <div style="position: relative; display: inline-block">
                <div class="prev-tooltip">More information</div>
                <button class="prev-btn prev-btn--ghost">Hover me</button>
              </div>
            </div>
          </div>

          <!-- Tabs preview -->
          <div v-else-if="selected === 'Tabs'" class="preview-container">
            <div style="border-bottom: 1px solid #F0F0F1; display: flex; gap: 0">
              <button
                v-for="(t, i) in previewTabs"
                :key="t"
                class="prev-tab"
                :class="{ 'prev-tab--active': previewActiveTab === i }"
                @click="previewActiveTab = i"
              >
                {{ t }}
              </button>
            </div>
            <div style="padding: 20px 0; font-size: 13px; color: #71717A">
              Content for "{{ previewTabs[previewActiveTab] }}" tab
            </div>
          </div>

          <!-- Drift warning -->
          <div
            v-if="selectedComp.status === 'drifted'"
            style="display: flex; align-items: flex-start; gap: 10px; margin-top: 24px; padding: 14px 16px; background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 10px"
          >
            <AlertTriangle :size="14" color="#D97706" style="flex-shrink: 0; margin-top: 1px" />
            <div>
              <div style="font-size: 12px; font-weight: 600; color: #D97706">Drift detected</div>
              <div style="font-size: 11px; color: #92400E; margin-top: 2px; line-height: 1.5">
                {{ selectedComp.behindDetail }}
              </div>
            </div>
          </div>

          <!-- Missing banner -->
          <div
            v-if="selectedComp.status === 'missing'"
            style="display: flex; align-items: flex-start; gap: 10px; margin-top: 24px; padding: 14px 16px; background: #FEF2F2; border: 1px solid #FECACA; border-radius: 10px"
          >
            <AlertTriangle :size="14" color="#DC2626" style="flex-shrink: 0; margin-top: 1px" />
            <div>
              <div style="font-size: 12px; font-weight: 600; color: #DC2626">Missing in code</div>
              <div style="font-size: 11px; color: #991B1B; margin-top: 2px; line-height: 1.5">
                {{ selectedComp.behindDetail }}
              </div>
            </div>
          </div>
        </div>

        <!-- Code Tab -->
        <div v-if="activeDetailTab === 'code'" style="padding: 28px 0 0">
          <CodeBlock :code="selectedComp.code" language="vue" />
        </div>

        <!-- Usage Tab -->
        <div v-if="activeDetailTab === 'usage'" style="padding: 28px 0 0">
          <CodeBlock :code="selectedComp.usage" language="vue" />
        </div>

        <!-- Props Tab -->
        <div v-if="activeDetailTab === 'props'" style="padding: 28px 0 0">
          <div style="border: 1px solid #E4E4E7; border-radius: 8px; overflow: hidden">
            <table style="width: 100%; border-collapse: collapse">
              <thead>
                <tr style="background: #FAFAFA">
                  <th class="props-th">Prop</th>
                  <th class="props-th">Type</th>
                  <th class="props-th">Default</th>
                  <th class="props-th">Required</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="prop in selectedComp.props"
                  :key="prop.name"
                  style="border-top: 1px solid #F0F0F1"
                >
                  <td class="props-td">
                    <span style="font-family: monospace; font-size: 12px; font-weight: 600; color: #09090B">{{ prop.name }}</span>
                  </td>
                  <td class="props-td">
                    <span style="font-family: monospace; font-size: 11px; color: #71717A">{{ prop.type }}</span>
                  </td>
                  <td class="props-td">
                    <span style="font-family: monospace; font-size: 11px; color: #A1A1AA">{{ prop.default }}</span>
                  </td>
                  <td class="props-td">
                    <span
                      v-if="prop.required"
                      style="font-size: 10px; font-weight: 500; color: #16A34A; background: #F0FDF4; border: 1px solid #BBF7D0; padding: 1px 6px; border-radius: 4px"
                    >yes</span>
                    <span v-else style="font-size: 11px; color: #D4D4D8">&mdash;</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Action buttons -->
        <div style="display: flex; align-items: center; gap: 8px; margin-top: 40px; padding-bottom: 60px">
          <button v-if="selectedComp.status !== 'synced'" class="action-btn action-btn--primary">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style="margin-right: 6px">
              <path d="M8 1L14.9282 5.5V10.5L8 15L1.07179 10.5V5.5L8 1Z" stroke="currentColor" stroke-width="1.2" fill="none"/>
            </svg>
            Create Linear issue
          </button>
          <button class="action-btn action-btn--ghost">
            <ExternalLink :size="13" style="margin-right: 4px" />
            Figma
          </button>
          <button v-if="selectedComp.status !== 'missing'" class="action-btn action-btn--ghost">
            <Code2 :size="13" style="margin-right: 4px" />
            GitHub
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  AlertTriangle,
  ChevronLeft,
  Eye,
  Code2,
  Play,
  List,
  LayoutGrid,
  ExternalLink,
  Check,
} from 'lucide-vue-next'
import type { LibraryComponent } from '~/types'

const { libraryData } = useMockData()

const selected = ref<string | null>(null)
const activeFilter = ref<string>('all')
const activeDetailTab = ref<string>('preview')
const viewMode = ref<'grid' | 'list'>('grid')
const previewActiveTab = ref(0)
const previewTabs = ['Overview', 'Settings', 'Activity']

const componentCount = computed(() => Object.keys(libraryData).length)
const componentEntries = computed(() => Object.entries(libraryData))

const driftedCount = computed(() =>
  componentEntries.value.filter(([, c]) => c.status === 'drifted').length,
)
const missingCount = computed(() =>
  componentEntries.value.filter(([, c]) => c.status === 'missing').length,
)
const syncedCount = computed(() =>
  componentEntries.value.filter(([, c]) => c.status === 'synced').length,
)

const filterTabs = computed(() => [
  { key: 'all', label: 'All', count: componentCount.value, dot: null },
  { key: 'drifted', label: 'Outdated', count: driftedCount.value, dot: '#D97706' },
  { key: 'missing', label: 'Missing', count: missingCount.value, dot: '#DC2626' },
  { key: 'synced', label: 'Up to date', count: syncedCount.value, dot: '#16A34A' },
])

const filteredComponents = computed(() => {
  const entries = componentEntries.value
  if (activeFilter.value === 'all') return Object.fromEntries(entries)
  return Object.fromEntries(
    entries.filter(([, c]) => c.status === activeFilter.value),
  )
})

const selectedComp = computed<LibraryComponent>(() => {
  return libraryData[selected.value!]
})

const detailBadgeLabel = computed(() => {
  if (selectedComp.value.status === 'synced') return 'Up to date'
  if (selectedComp.value.status === 'drifted') {
    return selectedComp.value.behind === 'code' ? 'Code outdated' : 'Figma outdated'
  }
  return 'Not in code'
})

const detailTabs = computed(() => [
  { key: 'preview', label: 'Preview', icon: Eye },
  { key: 'code', label: 'Code', icon: Code2 },
  { key: 'usage', label: 'Usage', icon: Play },
  { key: 'props', label: 'Props', icon: List },
])

function selectComponent(name: string) {
  selected.value = name
  activeDetailTab.value = 'preview'
  previewActiveTab.value = 0
}

function statusLabel(status: string) {
  if (status === 'synced') return 'Up to date'
  if (status === 'drifted') return 'Outdated'
  return 'Missing'
}
</script>

<style scoped>
/* View toggle */
.view-toggle {
  width: 30px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  color: #71717a;
  border-radius: 6px;
  cursor: pointer;
  transition: all 120ms ease;
}
.view-toggle:hover { color: #3f3f46; }
.view-toggle--active {
  background: white;
  color: #1a1a1a;
  box-shadow: 0 1px 2px rgba(0,0,0,0.06);
}

/* Filter tabs */
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
.filter-tab:hover { color: #3F3F46; }
.filter-tab--active {
  font-weight: 600;
  color: #09090B;
  border-bottom-color: #2C2C2E;
}

/* Insight cards */
.insight-card {
  padding: 14px 16px;
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
  transition: all 120ms ease;
}
.insight-card:hover { opacity: 0.85; }

/* Component cards (grid) */
.comp-card {
  border: 1px solid #E4E4E7;
  border-radius: 10px;
  padding: 16px;
  cursor: pointer;
  transition: all 120ms ease;
  background: #FFFFFF;
}
.comp-card:hover {
  border-color: #2C2C2E;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* List rows */
.list-row {
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 12px;
  height: 48px;
  cursor: pointer;
  transition: background 100ms ease;
}
.list-row:hover { background: #fafafa; }

/* Status pills */
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
  flex-shrink: 0;
}
.status-pill--synced { background: #F0FDF4; color: #16A34A; border-color: #BBF7D0; }
.status-pill--drifted { background: #FFFBEB; color: #D97706; border-color: #FDE68A; }
.status-pill--missing { background: #FEF2F2; color: #DC2626; border-color: #FECACA; }

/* Detail badge */
.detail-badge {
  font-size: 11px;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 20px;
  border: 1px solid;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}
.detail-badge--synced { background: #F0FDF4; color: #16A34A; border-color: #BBF7D0; }
.detail-badge--drifted { background: #FFFBEB; color: #D97706; border-color: #FDE68A; }
.detail-badge--missing { background: #FEF2F2; color: #DC2626; border-color: #FECACA; }

/* Back button */
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: #71717A;
  background: none;
  border: none;
  cursor: pointer;
  padding: 24px 0 8px;
  transition: color 120ms ease;
  font-family: inherit;
}
.back-btn:hover { color: #09090B; }

/* Detail tabs */
.detail-tab {
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
  font-family: inherit;
}
.detail-tab:hover { color: #3F3F46; }
.detail-tab--active {
  font-weight: 600;
  color: #09090B;
  border-bottom-color: #2C2C2E;
}

/* Preview container */
.preview-container {
  border: 1px dashed #E4E4E7;
  border-radius: 10px;
  padding: 28px 24px;
  background: #FAFAFA;
}

/* Preview: Buttons */
.prev-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 120ms ease;
  display: inline-flex;
  align-items: center;
  border: none;
  font-family: inherit;
}
.prev-btn--primary { background: #2C2C2E; color: #FFF; }
.prev-btn--primary:hover { background: #1C1C1E; }
.prev-btn--secondary { background: #F4F4F5; color: #3F3F46; border: 1px solid #E4E4E7; }
.prev-btn--ghost { background: transparent; color: #3F3F46; border: 1px solid #E4E4E7; }
.prev-btn--ghost:hover { border-color: #D4D4D8; background: #FAFAFA; }
.prev-btn--danger { background: #DC2626; color: #FFF; }
.prev-btn--danger:hover { background: #B91C1C; }
.prev-btn--sm { padding: 5px 10px; font-size: 11px; }
.prev-btn--lg { padding: 12px 24px; font-size: 15px; }

/* Preview: Badges */
.prev-badge { font-size: 11px; font-weight: 500; padding: 3px 9px; border-radius: 6px; display: inline-block; }
.prev-badge--default { background: #F4F4F5; color: #71717A; }
.prev-badge--success { background: #F0FDF4; color: #16A34A; }
.prev-badge--warning { background: #FFFBEB; color: #D97706; }
.prev-badge--error { background: #FEF2F2; color: #DC2626; }
.prev-badge--brand { background: #F5F5F5; color: #2C2C2E; border: 1px solid #D4D4D4; }

/* Preview: Inputs */
.prev-input-group { display: flex; flex-direction: column; }
.prev-input-label { font-size: 12px; font-weight: 500; color: #3F3F46; margin-bottom: 5px; }
.prev-input {
  padding: 8px 12px;
  border: 1px solid #E4E4E7;
  border-radius: 8px;
  font-size: 13px;
  color: #09090B;
  background: #FFF;
  outline: none;
  transition: border-color 120ms ease;
  font-family: inherit;
}
.prev-input:focus { border-color: #2C2C2E; }
.prev-input--error { border-color: #DC2626; }
.prev-input--error:focus { border-color: #DC2626; }
.prev-input--disabled { background: #F4F4F5; color: #A1A1AA; cursor: not-allowed; }

/* Preview: Avatar */
.prev-avatar {
  border-radius: 50%;
  background: #2C2C2E;
  color: #FFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}
.prev-avatar-stack {
  width: 32px; height: 32px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 600;
  border: 2px solid #FAFAFA;
}

/* Preview: Cards */
.prev-card { flex: 1; padding: 16px; border-radius: 10px; background: #FFF; }
.prev-card--default { border: 1px solid #E4E4E7; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04); }
.prev-card--subtle { border: 1px solid #F0F0F1; background: #FAFAFA; }
.prev-card--highlighted { border: 2px solid #2C2C2E; }

/* Preview: Tooltip */
.prev-tooltip {
  position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%);
  margin-bottom: 8px; background: #2C2C2E; color: #FFF;
  font-size: 11px; font-weight: 500; padding: 5px 10px; border-radius: 6px; white-space: nowrap;
}
.prev-tooltip::after {
  content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%);
  border: 5px solid transparent; border-top-color: #2C2C2E;
}

/* Preview: Tabs */
.prev-tab {
  padding: 10px 16px; font-size: 13px; font-weight: 450; color: #71717A;
  background: none; border: none; border-bottom: 2px solid transparent;
  cursor: pointer; transition: all 120ms ease; font-family: inherit;
}
.prev-tab:hover { color: #3F3F46; }
.prev-tab--active { font-weight: 600; color: #09090B; border-bottom-color: #2C2C2E; }

/* Props table */
.props-th { text-align: left; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #A1A1AA; padding: 10px 16px; }
.props-td { padding: 10px 16px; vertical-align: top; }

/* Action buttons */
.action-btn {
  display: inline-flex; align-items: center; padding: 8px 16px;
  border-radius: 8px; font-size: 13px; font-weight: 500;
  cursor: pointer; transition: all 120ms ease; font-family: inherit;
}
.action-btn--primary { background: #2C2C2E; color: #FFF; border: none; }
.action-btn--primary:hover { background: #1C1C1E; }
.action-btn--ghost { background: transparent; color: #3F3F46; border: 1px solid #E4E4E7; }
.action-btn--ghost:hover { border-color: #D4D4D8; background: #FAFAFA; }
</style>
