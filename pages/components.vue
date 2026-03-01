<template>
  <div style="overflow-x: hidden; max-width: 100%">
    <div style="padding: 0 40px; overflow: hidden">

      <!-- LIST VIEW -->
      <template v-if="!selected">
        <!-- Header -->
        <div style="padding: 40px 0 0">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 16px">
            <div>
              <h1 style="font-size: 24px; font-weight: 700; letter-spacing: -0.8px; color: #09090B; margin: 0">
                Components
              </h1>
              <p style="font-size: 13px; color: #71717A; margin: 8px 0 0">
                {{ totalCount }} components &middot; Figma &harr; Code sync status
              </p>
            </div>
            <div style="display: flex; align-items: center; gap: 8px">
              <!-- Search -->
              <div style="position: relative">
                <Search :size="14" color="#A1A1AA" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); pointer-events: none" />
                <input
                  v-model="searchQuery"
                  placeholder="Search components..."
                  class="search-input"
                />
              </div>
              <!-- Grid/List toggle -->
              <div style="display: flex; background: #f4f4f5; border-radius: 8px; padding: 2px">
                <button class="view-toggle" :class="{ 'view-toggle--active': viewMode === 'grid' }" @click="viewMode = 'grid'">
                  <LayoutGrid :size="14" />
                </button>
                <button class="view-toggle" :class="{ 'view-toggle--active': viewMode === 'list' }" @click="viewMode = 'list'">
                  <List :size="14" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Category tabs -->
        <div style="display: flex; align-items: center; gap: 0; margin-top: 28px; border-bottom: 1px solid #F0F0F1; overflow-x: auto; scrollbar-width: none">
          <button
            v-for="cat in categoryTabs"
            :key="cat.key"
            class="filter-tab"
            :class="{ 'filter-tab--active': activeCategory === cat.key }"
            @click="activeCategory = cat.key; currentPage = 1"
          >
            {{ cat.label }}
            <span style="margin-left: 3px; opacity: 0.5; font-variant-numeric: tabular-nums">{{ cat.count }}</span>
          </button>
        </div>

        <!-- Loading -->
        <div v-if="loading" style="padding: 60px 0; text-align: center">
          <RefreshCw :size="18" color="#A1A1AA" class="animate-spin" />
          <p style="font-size: 13px; color: #A1A1AA; margin-top: 12px">Loading components...</p>
        </div>

        <!-- Empty state -->
        <div v-else-if="filteredComponents.length === 0" style="padding: 60px 0; text-align: center">
          <Package :size="28" color="#D4D4D8" style="margin: 0 auto" />
          <p style="font-size: 13px; color: #A1A1AA; margin-top: 12px">
            {{ searchQuery ? 'No components match your search' : 'No components synced yet' }}
          </p>
        </div>

        <template v-else>
          <!-- Results count -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 16px">
            <span style="font-size: 12px; color: #A1A1AA">
              Showing {{ pageStart + 1 }}&ndash;{{ Math.min(pageEnd, filteredComponents.length) }} of {{ filteredComponents.length }}
            </span>
          </div>

          <!-- GRID VIEW -->
          <div
            v-if="viewMode === 'grid'"
            style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-top: 12px"
          >
            <div
              v-for="comp in paginatedComponents"
              :key="comp.id"
              class="comp-card"
              @click="selectComponent(comp)"
            >
              <!-- Thumbnail -->
              <div class="thumb-area">
                <img
                  v-if="thumbnails[comp.figma_node_id]"
                  :src="thumbnails[comp.figma_node_id]"
                  :alt="comp.name"
                  class="thumb-img"
                />
                <div v-else class="thumb-placeholder">
                  <Component :size="20" color="#D4D4D8" />
                </div>
              </div>
              <!-- Info -->
              <div style="padding: 12px 14px 14px">
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px">
                  <span style="font-size: 13px; font-weight: 600; color: #09090B; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">{{ comp.name }}</span>
                  <span class="status-pill status-pill--missing">Missing</span>
                </div>
                <p v-if="comp.description" style="font-size: 11px; color: #A1A1AA; margin: 5px 0 0; line-height: 1.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">
                  {{ comp.description }}
                </p>
                <div style="display: flex; align-items: center; gap: 8px; margin-top: 8px">
                  <span v-if="comp.page_name" style="font-size: 10px; color: #71717A; background: #F4F4F5; padding: 2px 7px; border-radius: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 120px">
                    {{ comp.page_name }}
                  </span>
                  <span style="font-size: 11px; color: #A1A1AA; font-variant-numeric: tabular-nums; margin-left: auto">
                    {{ comp.variant_count }} variant{{ comp.variant_count > 1 ? 's' : '' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- LIST VIEW -->
          <div
            v-else
            style="margin-top: 12px; border: 1px solid #e4e4e7; border-radius: 10px; overflow: hidden"
          >
            <div
              v-for="(comp, i) in paginatedComponents"
              :key="comp.id"
              class="list-row"
              :style="{ borderTop: i > 0 ? '1px solid #f4f4f5' : 'none' }"
              @click="selectComponent(comp)"
            >
              <!-- Mini thumbnail -->
              <div class="list-thumb">
                <img
                  v-if="thumbnails[comp.figma_node_id]"
                  :src="thumbnails[comp.figma_node_id]"
                  :alt="comp.name"
                  style="width: 100%; height: 100%; object-fit: contain"
                />
                <Component v-else :size="12" color="#D4D4D8" />
              </div>
              <span style="font-size: 13px; font-weight: 600; color: #09090B; min-width: 140px; max-width: 200px; flex-shrink: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">{{ comp.name }}</span>
              <span v-if="comp.page_name" style="font-size: 10px; color: #71717A; background: #F4F4F5; padding: 2px 7px; border-radius: 4px; flex-shrink: 0">
                {{ comp.page_name }}
              </span>
              <span style="font-size: 12px; color: #A1A1AA; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">{{ comp.description }}</span>
              <div style="display: flex; align-items: center; gap: 10px; flex-shrink: 0">
                <span style="font-size: 11px; color: #a1a1aa; font-variant-numeric: tabular-nums">
                  {{ comp.variant_count }}v
                </span>
                <span class="status-pill status-pill--missing">Missing</span>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" style="display: flex; align-items: center; justify-content: center; gap: 4px; margin-top: 24px; padding-bottom: 60px">
            <button class="page-btn" :disabled="currentPage <= 1" @click="currentPage--">
              <ChevronLeft :size="14" />
            </button>
            <template v-for="p in visiblePages" :key="p">
              <span v-if="p === '...'" style="font-size: 12px; color: #A1A1AA; padding: 0 4px">&hellip;</span>
              <button
                v-else
                class="page-btn"
                :class="{ 'page-btn--active': currentPage === p }"
                @click="currentPage = p as number"
              >
                {{ p }}
              </button>
            </template>
            <button class="page-btn" :disabled="currentPage >= totalPages" @click="currentPage++">
              <ChevronRight :size="14" />
            </button>
          </div>
          <div v-else style="padding-bottom: 60px" />
        </template>
      </template>

      <!-- DETAIL VIEW -->
      <template v-else>
        <button class="back-btn" @click="selected = null; detailThumb = null">
          <ChevronLeft :size="12" />
          Components
        </button>

        <div style="padding-top: 8px; max-width: 680px">
          <div style="display: flex; align-items: center; gap: 10px">
            <h1 style="font-size: 24px; font-weight: 700; letter-spacing: -0.8px; color: #09090B; margin: 0">
              {{ selected.name }}
            </h1>
            <span class="detail-badge detail-badge--missing">Not in code</span>
          </div>

          <p v-if="selected.description" style="font-size: 13px; color: #71717A; margin: 10px 0 0; line-height: 1.6">
            {{ selected.description }}
          </p>

          <!-- Figma Preview -->
          <div class="preview-area" style="margin-top: 24px">
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-bottom: 1px solid #F0F0F1">
              <span style="font-size: 11px; font-weight: 600; color: #71717A; text-transform: uppercase; letter-spacing: 0.5px">Figma Preview</span>
              <button
                v-if="!detailThumb && !detailThumbLoading"
                class="load-preview-btn"
                @click="loadDetailThumbnail"
              >
                <ImageIcon :size="12" />
                Load preview
              </button>
              <RefreshCw v-if="detailThumbLoading" :size="12" color="#A1A1AA" class="animate-spin" />
            </div>
            <div style="min-height: 140px; display: flex; align-items: center; justify-content: center; background: #FAFAFA">
              <img
                v-if="detailThumb"
                :src="detailThumb"
                :alt="selected.name"
                style="max-width: 100%; max-height: 320px; object-fit: contain; padding: 16px"
              />
              <div v-else-if="detailThumbLoading" style="padding: 40px; text-align: center">
                <RefreshCw :size="16" color="#D4D4D8" class="animate-spin" />
                <p style="font-size: 11px; color: #A1A1AA; margin-top: 8px">Loading preview...</p>
              </div>
              <div v-else style="padding: 40px; text-align: center">
                <Component :size="28" color="#E4E4E7" />
                <p style="font-size: 11px; color: #A1A1AA; margin-top: 8px">Click "Load preview" to fetch from Figma</p>
              </div>
            </div>
          </div>

          <!-- Meta info -->
          <div style="display: flex; flex-wrap: wrap; gap: 12px; margin-top: 20px">
            <div class="meta-chip">
              <svg width="14" height="14" viewBox="0 0 38 57" fill="none"><path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" fill="#1ABCFE"/><path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z" fill="#0ACF83"/><path d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z" fill="#FF7262"/><path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" fill="#F24E1E"/><path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" fill="#A259FF"/></svg>
              {{ selected.variant_count }} variant{{ selected.variant_count > 1 ? 's' : '' }}
            </div>
            <div v-if="selected.page_name" class="meta-chip">
              <Layers :size="12" />
              {{ selected.page_name }}
            </div>
            <div v-if="selected.component_set_name" class="meta-chip">
              <Component :size="12" />
              {{ selected.component_set_name }}
            </div>
          </div>

          <!-- Status banner -->
          <div style="display: flex; align-items: flex-start; gap: 10px; margin-top: 24px; padding: 14px 16px; background: #FEF2F2; border: 1px solid #FECACA; border-radius: 10px">
            <AlertTriangle :size="14" color="#DC2626" style="flex-shrink: 0; margin-top: 1px" />
            <div>
              <div style="font-size: 12px; font-weight: 600; color: #DC2626">Missing in code</div>
              <div style="font-size: 11px; color: #991B1B; margin-top: 2px; line-height: 1.5">
                This component exists in Figma but has not been implemented in code yet.
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div style="display: flex; align-items: center; gap: 8px; margin-top: 24px; padding-bottom: 60px">
            <button class="action-btn action-btn--primary" @click="showLinearModal = true">
              <CirclePlus :size="13" style="margin-right: 4px" />
              Create Linear Issue
            </button>
            <button
              class="action-btn action-btn--ghost"
              @click="openInFigma"
            >
              <ExternalLink :size="13" style="margin-right: 4px" />
              Open in Figma
            </button>
          </div>
        </div>

        <!-- Linear Issue Modal -->
        <div v-if="showLinearModal" class="modal-overlay" @click.self="showLinearModal = false">
          <div class="modal-card">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px">
              <h3 style="font-size: 15px; font-weight: 600; color: #09090B; margin: 0">Create Linear Issue</h3>
              <button style="background: none; border: none; cursor: pointer; color: #A1A1AA; padding: 4px" @click="showLinearModal = false">
                <X :size="16" />
              </button>
            </div>
            <div style="margin-bottom: 14px">
              <label style="font-size: 12px; font-weight: 600; color: #09090B; display: block; margin-bottom: 6px">Title</label>
              <input
                v-model="linearTitle"
                class="modal-input"
                placeholder="Issue title..."
              />
            </div>
            <div style="margin-bottom: 14px">
              <label style="font-size: 12px; font-weight: 600; color: #09090B; display: block; margin-bottom: 6px">Priority</label>
              <div style="display: flex; gap: 6px">
                <button
                  v-for="p in ['high', 'medium', 'low']"
                  :key="p"
                  class="priority-btn"
                  :class="{ 'priority-btn--active': linearPriority === p, [`priority-btn--${p}`]: linearPriority === p }"
                  @click="linearPriority = p"
                >
                  {{ p }}
                </button>
              </div>
            </div>
            <div style="margin-bottom: 20px">
              <label style="font-size: 12px; font-weight: 600; color: #09090B; display: block; margin-bottom: 6px">Description</label>
              <textarea
                v-model="linearDesc"
                class="modal-input"
                rows="3"
                placeholder="Additional details..."
                style="resize: vertical; min-height: 60px"
              />
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 8px">
              <button class="action-btn action-btn--ghost" @click="showLinearModal = false">Cancel</button>
              <button class="action-btn action-btn--primary" @click="createLinearIssue">
                <CirclePlus :size="13" style="margin-right: 4px" />
                Create
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  Search,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  List,
  LayoutGrid,
  ExternalLink,
  RefreshCw,
  Package,
  Layers,
  Component,
  CirclePlus,
  X,
  Image as ImageIcon,
} from 'lucide-vue-next'
import type { FigmaComponent } from '~/types'

// Data
const { connection, fetchStatus } = useFigmaConnection()
const { components, loading, fetchComponents } = useFigmaComponents()

// Fetch on mount
onMounted(async () => {
  await fetchStatus()
  if (connection.value.connected) {
    await fetchComponents()
  }
})

// State
const selected = ref<FigmaComponent | null>(null)
const searchQuery = ref('')
const activeCategory = ref('all')
const viewMode = ref<'grid' | 'list'>('grid')
const currentPage = ref(1)
const PER_PAGE = 60

// Thumbnails cache
const thumbnails = ref<Record<string, string>>({})
const thumbsLoading = ref(false)

// Detail view thumbnail
const detailThumb = ref<string | null>(null)
const detailThumbLoading = ref(false)

// Linear modal
const showLinearModal = ref(false)
const linearTitle = ref('')
const linearPriority = ref('medium')
const linearDesc = ref('')

// Categories from page_name
const categories = computed(() => {
  const cats = new Map<string, number>()
  for (const comp of components.value) {
    const page = comp.page_name || 'Uncategorized'
    cats.set(page, (cats.get(page) || 0) + 1)
  }
  return Array.from(cats.entries()).sort((a, b) => b[1] - a[1])
})

const categoryTabs = computed(() => {
  const tabs = [{ key: 'all', label: 'All', count: components.value.length }]
  for (const [name, count] of categories.value) {
    tabs.push({ key: name, label: name, count })
  }
  return tabs
})

const totalCount = computed(() => components.value.length)

// Filter by category + search
const filteredComponents = computed(() => {
  let filtered = components.value

  if (activeCategory.value !== 'all') {
    filtered = filtered.filter(c => (c.page_name || 'Uncategorized') === activeCategory.value)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    filtered = filtered.filter(c =>
      c.name.toLowerCase().includes(q)
      || (c.description && c.description.toLowerCase().includes(q))
      || (c.page_name && c.page_name.toLowerCase().includes(q)),
    )
  }

  return filtered
})

// Pagination
const totalPages = computed(() => Math.ceil(filteredComponents.value.length / PER_PAGE))
const pageStart = computed(() => (currentPage.value - 1) * PER_PAGE)
const pageEnd = computed(() => pageStart.value + PER_PAGE)
const paginatedComponents = computed(() => filteredComponents.value.slice(pageStart.value, pageEnd.value))

watch([searchQuery, activeCategory], () => {
  currentPage.value = 1
})

// Visible page numbers
const visiblePages = computed(() => {
  const total = totalPages.value
  const cur = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | string)[] = [1]
  if (cur > 3) pages.push('...')
  for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) {
    pages.push(i)
  }
  if (cur < total - 2) pages.push('...')
  pages.push(total)
  return pages
})

// Load thumbnails for currently visible components
async function loadThumbnails(comps: FigmaComponent[]) {
  // Filter to components we don't have thumbnails for yet
  const needed = comps
    .map(c => c.figma_node_id)
    .filter(id => id && !thumbnails.value[id])

  if (!needed.length) return

  thumbsLoading.value = true
  try {
    const { images } = await $fetch<{ images: Record<string, string> }>('/api/figma/thumbnails', {
      method: 'POST',
      body: { nodeIds: needed.slice(0, 50) },
    })
    // Merge into cache
    thumbnails.value = { ...thumbnails.value, ...images }
  } catch {
    // Silently fail — thumbnails are optional
  } finally {
    thumbsLoading.value = false
  }
}

// Watch paginated components to load thumbnails
watch(paginatedComponents, (comps) => {
  if (comps.length > 0) {
    loadThumbnails(comps)
  }
}, { immediate: true })

// Detail view
function selectComponent(comp: FigmaComponent) {
  selected.value = comp
  detailThumb.value = thumbnails.value[comp.figma_node_id] || null
  // Pre-fill Linear issue title
  linearTitle.value = `Implement ${comp.name} component`
  linearDesc.value = comp.description
    ? `Figma component "${comp.name}" needs to be implemented in code.\n\nDescription: ${comp.description}`
    : `Figma component "${comp.name}" needs to be implemented in code.`
  linearPriority.value = 'medium'

  // Auto-load thumbnail if we don't have it
  if (!detailThumb.value && comp.figma_node_id) {
    loadDetailThumbnail()
  }
}

async function loadDetailThumbnail() {
  if (!selected.value?.figma_node_id) return
  detailThumbLoading.value = true
  try {
    const { images } = await $fetch<{ images: Record<string, string> }>('/api/figma/thumbnails', {
      method: 'POST',
      body: { nodeIds: [selected.value.figma_node_id] },
    })
    const url = images[selected.value.figma_node_id]
    if (url) {
      detailThumb.value = url
      // Also cache it
      thumbnails.value = { ...thumbnails.value, [selected.value.figma_node_id]: url }
    }
  } catch {
    // Silently fail
  } finally {
    detailThumbLoading.value = false
  }
}

function openInFigma() {
  if (!selected.value || !connection.value.fileKey) return
  const nodeId = selected.value.figma_node_id.replace(':', '-')
  const url = `https://www.figma.com/design/${connection.value.fileKey}?node-id=${nodeId}`
  window.open(url, '_blank')
}

function createLinearIssue() {
  // For now, copy to clipboard and close modal (Linear API integration coming)
  const text = `[${linearPriority.value.toUpperCase()}] ${linearTitle.value}\n\n${linearDesc.value}`
  navigator.clipboard.writeText(text).catch(() => {})
  showLinearModal.value = false
}
</script>

<style scoped>
/* Search */
.search-input {
  padding: 7px 10px 7px 30px;
  border: 1px solid #E4E4E7;
  border-radius: 8px;
  font-size: 13px;
  color: #09090B;
  background: #FFF;
  outline: none;
  width: 220px;
  transition: border-color 120ms ease;
  font-family: inherit;
}
.search-input:focus { border-color: #2C2C2E; }
.search-input::placeholder { color: #D4D4D8; }

/* View toggle */
.view-toggle {
  width: 30px; height: 28px; display: flex; align-items: center; justify-content: center;
  border: none; background: none; color: #71717a; border-radius: 6px; cursor: pointer;
  transition: all 120ms ease;
}
.view-toggle:hover { color: #3f3f46; }
.view-toggle--active { background: white; color: #1a1a1a; box-shadow: 0 1px 2px rgba(0,0,0,0.06); }

/* Filter tabs */
.filter-tab {
  padding: 10px 14px; font-size: 12px; font-weight: 450; color: #71717A;
  background: none; border: none; border-bottom: 2px solid transparent;
  cursor: pointer; transition: all 120ms ease; display: inline-flex; align-items: center;
  white-space: nowrap; flex-shrink: 0; font-family: inherit;
}
.filter-tab:hover { color: #3F3F46; }
.filter-tab--active { font-weight: 600; color: #09090B; border-bottom-color: #2C2C2E; }

/* Component cards */
.comp-card {
  border: 1px solid #E4E4E7; border-radius: 10px; overflow: hidden;
  cursor: pointer; transition: all 120ms ease; background: #FFFFFF;
}
.comp-card:hover { border-color: #2C2C2E; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04); }

/* Thumbnails */
.thumb-area {
  height: 110px; background: #FAFAFA; border-bottom: 1px solid #F0F0F1;
  display: flex; align-items: center; justify-content: center; overflow: hidden;
}
.thumb-img {
  max-width: 100%; max-height: 100%; object-fit: contain; padding: 10px;
}
.thumb-placeholder {
  display: flex; align-items: center; justify-content: center;
}

/* List rows */
.list-row {
  display: flex; align-items: center; padding: 0 16px; gap: 10px; height: 48px;
  cursor: pointer; transition: background 100ms ease;
}
.list-row:hover { background: #fafafa; }

.list-thumb {
  width: 32px; height: 32px; border-radius: 6px; background: #FAFAFA; border: 1px solid #F0F0F1;
  display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0;
}

/* Status pills */
.status-pill {
  font-size: 10px; font-weight: 500; padding: 2px 7px; border-radius: 20px;
  border: 1px solid; display: inline-flex; align-items: center; gap: 3px;
  white-space: nowrap; flex-shrink: 0;
}
.status-pill--synced { background: #F0FDF4; color: #16A34A; border-color: #BBF7D0; }
.status-pill--drifted { background: #FFFBEB; color: #D97706; border-color: #FDE68A; }
.status-pill--missing { background: #FEF2F2; color: #DC2626; border-color: #FECACA; }

/* Pagination */
.page-btn {
  width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
  border: 1px solid #E4E4E7; border-radius: 8px; background: #FFF; color: #3F3F46;
  font-size: 12px; font-weight: 500; cursor: pointer; transition: all 120ms ease; font-family: inherit;
}
.page-btn:hover:not(:disabled) { border-color: #2C2C2E; background: #FAFAFA; }
.page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.page-btn--active { background: #1a1a1a; color: #FFF; border-color: #1a1a1a; }

/* Detail badge */
.detail-badge {
  font-size: 11px; font-weight: 500; padding: 3px 10px; border-radius: 20px;
  border: 1px solid; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;
}
.detail-badge--synced { background: #F0FDF4; color: #16A34A; border-color: #BBF7D0; }
.detail-badge--drifted { background: #FFFBEB; color: #D97706; border-color: #FDE68A; }
.detail-badge--missing { background: #FEF2F2; color: #DC2626; border-color: #FECACA; }

/* Meta chips */
.meta-chip {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12px; color: #71717A; background: #F4F4F5;
  padding: 5px 10px; border-radius: 6px;
}

/* Preview area */
.preview-area {
  border: 1px solid #E4E4E7; border-radius: 10px; overflow: hidden;
}

.load-preview-btn {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 11px; font-weight: 500; color: #71717A; background: none;
  border: 1px solid #E4E4E7; border-radius: 6px; padding: 4px 10px;
  cursor: pointer; transition: all 120ms ease; font-family: inherit;
}
.load-preview-btn:hover { color: #09090B; border-color: #D4D4D8; }

/* Back button */
.back-btn {
  display: inline-flex; align-items: center; gap: 3px;
  font-size: 12px; color: #71717A; background: none; border: none;
  cursor: pointer; padding: 24px 0 8px; transition: color 120ms ease; font-family: inherit;
}
.back-btn:hover { color: #09090B; }

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

/* Modal */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.3); backdrop-filter: blur(2px);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.modal-card {
  background: #FFF; border-radius: 14px; padding: 24px; width: 440px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12);
}
.modal-input {
  width: 100%; padding: 9px 12px; border: 1px solid #E4E4E7; border-radius: 8px;
  font-size: 13px; color: #09090B; outline: none; background: #FFF;
  transition: border-color 120ms ease; font-family: inherit; box-sizing: border-box;
}
.modal-input:focus { border-color: #2C2C2E; }

/* Priority buttons */
.priority-btn {
  padding: 5px 14px; border: 1px solid #E4E4E7; border-radius: 6px;
  font-size: 12px; font-weight: 500; color: #71717A; background: #FFF;
  cursor: pointer; transition: all 120ms ease; text-transform: capitalize; font-family: inherit;
}
.priority-btn:hover { border-color: #D4D4D8; }
.priority-btn--active.priority-btn--high { background: #FEF2F2; color: #DC2626; border-color: #FECACA; }
.priority-btn--active.priority-btn--medium { background: #FFFBEB; color: #D97706; border-color: #FDE68A; }
.priority-btn--active.priority-btn--low { background: #F0FDF4; color: #16A34A; border-color: #BBF7D0; }

/* Animations */
.animate-spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
