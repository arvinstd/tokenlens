<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click.self="close">
        <div class="modal-card">
          <!-- Search input -->
          <div class="modal-search">
            <Search :size="16" :stroke-width="2" style="color: #a1a1aa; flex-shrink: 0" />
            <input
              ref="inputRef"
              v-model="query"
              type="text"
              placeholder="Search components, tokens, pages..."
              class="modal-search-input"
              @keydown.esc="close"
            />
            <kbd class="modal-kbd">ESC</kbd>
          </div>

          <!-- Results -->
          <div class="modal-results">
            <template v-for="cat in filteredCategories" :key="cat.label">
              <div class="modal-category">{{ cat.label }}</div>
              <button
                v-for="item in cat.items"
                :key="item.name"
                class="modal-result-item"
                @click="navigateTo(item)"
              >
                <div
                  class="modal-result-icon"
                  :style="{ background: item.iconBg }"
                >
                  <component :is="item.icon" :size="13" :stroke-width="2" :style="{ color: item.iconColor }" />
                </div>
                <div style="flex: 1; min-width: 0">
                  <div class="modal-result-name">{{ item.name }}</div>
                  <div class="modal-result-desc">{{ item.description }}</div>
                </div>
                <ArrowRight :size="13" :stroke-width="1.5" style="color: #d4d4d8; flex-shrink: 0" />
              </button>
            </template>

            <!-- Empty state -->
            <div v-if="filteredCategories.length === 0" class="modal-empty">
              <Search :size="20" :stroke-width="1.5" style="color: #d4d4d8" />
              <span>No results for "{{ query }}"</span>
            </div>
          </div>

          <!-- Footer -->
          <div class="modal-footer">
            <div class="modal-footer-hint">
              <kbd class="modal-footer-kbd">&uarr;</kbd>
              <kbd class="modal-footer-kbd">&darr;</kbd>
              <span>Navigate</span>
            </div>
            <div class="modal-footer-hint">
              <kbd class="modal-footer-kbd">&crarr;</kbd>
              <span>Open</span>
            </div>
            <div class="modal-footer-hint">
              <kbd class="modal-footer-kbd">esc</kbd>
              <span>Close</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import {
  Search,
  ArrowRight,
  Palette,
  Type,
  Sun,
  Box,
  Square,
  Layers,
  Component,
  LayoutDashboard,
  Library,
  GitBranch,
  Figma,
  RefreshCw,
  Settings,
  TrendingUp
} from 'lucide-vue-next'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()

const query = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

function close() {
  emit('update:modelValue', false)
  query.value = ''
}

function navigateTo(item: any) {
  if (item.to) {
    navigateTo2(item.to)
  }
  close()
}

const router = useRouter()
function navigateTo2(path: string) {
  router.push(path)
}

// Auto-focus input when modal opens
watch(() => props.modelValue, (val) => {
  if (val) {
    nextTick(() => inputRef.value?.focus())
  }
})

interface SearchItem {
  name: string
  description: string
  icon: any
  iconBg: string
  iconColor: string
  to?: string
}

interface SearchCategory {
  label: string
  items: SearchItem[]
}

const categories: SearchCategory[] = [
  {
    label: 'Pages',
    items: [
      { name: 'Dashboard', description: 'Health score & overview', icon: LayoutDashboard, iconBg: '#f0f9ff', iconColor: '#0ea5e9', to: '/dashboard' },
      { name: 'Library', description: 'Token library explorer', icon: Library, iconBg: '#faf5ff', iconColor: '#a855f7', to: '/library' },
      { name: 'Components', description: 'Component audit', icon: Component, iconBg: '#fff7ed', iconColor: '#f97316', to: '/components' },
      { name: 'Tokens', description: 'Token inventory', icon: Layers, iconBg: '#f0fdf4', iconColor: '#22c55e', to: '/tokens' },
    ]
  },
  {
    label: 'Token Categories',
    items: [
      { name: 'Colors', description: '24 tokens · 3 drifted', icon: Palette, iconBg: '#fdf2f8', iconColor: '#ec4899' },
      { name: 'Typography', description: '18 tokens · 1 missing', icon: Type, iconBg: '#eff6ff', iconColor: '#3b82f6' },
      { name: 'Spacing', description: '12 tokens · all synced', icon: Box, iconBg: '#ecfdf5', iconColor: '#10b981' },
      { name: 'Shadows', description: '6 tokens · 2 drifted', icon: Sun, iconBg: '#fffbeb', iconColor: '#f59e0b' },
      { name: 'Radii', description: '8 tokens · all synced', icon: Square, iconBg: '#f5f3ff', iconColor: '#8b5cf6' },
    ]
  },
  {
    label: 'Quick Actions',
    items: [
      { name: 'Run Full Scan', description: 'Sync Figma & codebase tokens', icon: RefreshCw, iconBg: '#f0f0f1', iconColor: '#52525b' },
      { name: 'View Drift Report', description: 'See all mismatched tokens', icon: TrendingUp, iconBg: '#fef2f2', iconColor: '#ef4444' },
      { name: 'Open Settings', description: 'Configure sources & alerts', icon: Settings, iconBg: '#f0f0f1', iconColor: '#71717a' },
    ]
  }
]

const filteredCategories = computed(() => {
  if (!query.value.trim()) return categories

  const q = query.value.toLowerCase()
  return categories
    .map(cat => ({
      ...cat,
      items: cat.items.filter(
        item =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
      )
    }))
    .filter(cat => cat.items.length > 0)
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 12vh;
  z-index: 100;
}
.modal-card {
  width: 520px;
  max-height: 70vh;
  background: #FFFFFF;
  border-radius: 14px;
  box-shadow:
    0 24px 48px rgba(0, 0, 0, 0.16),
    0 0 0 1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.modal-search {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f1;
}
.modal-search-input {
  flex: 1;
  border: none;
  background: none;
  outline: none;
  font-size: 15px;
  font-weight: 400;
  color: #09090b;
  font-family: inherit;
  min-width: 0;
}
.modal-search-input::placeholder {
  color: #a1a1aa;
}
.modal-kbd {
  font-size: 10px;
  font-weight: 500;
  color: #a1a1aa;
  background: #f4f4f5;
  border: 1px solid #e4e4e7;
  border-radius: 4px;
  padding: 2px 6px;
  line-height: 16px;
  font-family: inherit;
  flex-shrink: 0;
}
.modal-results {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}
.modal-category {
  font-size: 11px;
  font-weight: 600;
  color: #a1a1aa;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 12px 10px 6px;
}
.modal-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border: none;
  background: none;
  border-radius: 9px;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: background 100ms ease;
  font-family: inherit;
}
.modal-result-item:hover {
  background: #f4f4f5;
}
.modal-result-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.modal-result-name {
  font-size: 13.5px;
  font-weight: 530;
  color: #18181b;
  line-height: 1.2;
  letter-spacing: -0.1px;
}
.modal-result-desc {
  font-size: 12px;
  font-weight: 400;
  color: #a1a1aa;
  line-height: 1.3;
  margin-top: 1px;
}
.modal-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px 20px;
  color: #a1a1aa;
  font-size: 13px;
  font-weight: 450;
}
.modal-footer {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 16px;
  border-top: 1px solid #f0f0f1;
  background: #fafafa;
}
.modal-footer-hint {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #a1a1aa;
  font-weight: 400;
}
.modal-footer-kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  font-size: 10px;
  font-weight: 500;
  color: #71717a;
  background: #ffffff;
  border: 1px solid #e4e4e7;
  border-radius: 3px;
  padding: 0 3px;
  font-family: inherit;
}

/* Transitions */
.modal-enter-active {
  transition: opacity 150ms ease;
}
.modal-enter-active .modal-card {
  transition: opacity 150ms ease, transform 150ms cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-leave-active {
  transition: opacity 100ms ease;
}
.modal-leave-active .modal-card {
  transition: opacity 100ms ease, transform 100ms ease;
}
.modal-enter-from {
  opacity: 0;
}
.modal-enter-from .modal-card {
  opacity: 0;
  transform: scale(0.96) translateY(-8px);
}
.modal-leave-to {
  opacity: 0;
}
.modal-leave-to .modal-card {
  opacity: 0;
  transform: scale(0.98) translateY(4px);
}
</style>
