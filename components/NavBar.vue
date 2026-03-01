<template>
  <nav
    style="
      position: fixed;
      top: 0;
      left: 0;
      width: 240px;
      height: 100vh;
      display: flex;
      flex-direction: column;
      padding: 20px 12px 10px;
      background: #FCFCFC;
      border-right: 1px solid #f0f0f0;
      z-index: 20;
    "
  >
    <!-- Logo + Search icon -->
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 0 8px; margin-bottom: 28px">
      <Logo />
      <button
        class="search-icon-btn"
        @click="openSearch"
        title="Search (⌘K)"
      >
        <Search :size="15" :stroke-width="2" />
      </button>
    </div>

    <!-- Navigation links -->
    <div style="display: flex; flex-direction: column; gap: 1px">
      <NuxtLink
        v-for="item in tabs"
        :key="item.key"
        :to="item.to"
        class="nav-item"
        :class="{ 'nav-item--active': isActive(item.key) }"
      >
        <component :is="item.icon" :size="15" :stroke-width="isActive(item.key) ? 2.2 : 1.8" />
        {{ item.label }}
      </NuxtLink>
    </div>

    <!-- Sources section -->
    <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px">
      <div style="padding: 8px 10px 0; font-size: 12px; font-weight: 500; color: #737373; line-height: 18px">Sources</div>
      <div style="display: flex; flex-direction: column; gap: 0">
        <a
          v-for="source in sources"
          :key="source.label"
          :href="source.href"
          target="_blank"
          class="source-item"
        >
          <div class="source-avatar" :style="{ background: source.avatarBg }">
            <component :is="source.icon" :size="10" :stroke-width="2" :style="{ color: source.avatarColor }" />
          </div>
          {{ source.label }}
        </a>
      </div>
    </div>

    <!-- Spacer -->
    <div style="flex: 1" />

    <!-- Bottom: Sync button -->
    <button
      class="scan-btn"
      @mouseenter="(e: MouseEvent) => { (e.currentTarget as HTMLElement).style.background = '#333' }"
      @mouseleave="(e: MouseEvent) => { (e.currentTarget as HTMLElement).style.background = '#1a1a1a' }"
    >
      <RefreshCw :size="13" :stroke-width="2.2" />
      Sync
    </button>

    <!-- Search Modal -->
    <SearchModal v-model="searchOpen" />
  </nav>
</template>

<script setup lang="ts">
import { LayoutDashboard, Component, Layers, RefreshCw, Settings, Search, Github, Figma } from 'lucide-vue-next'

const route = useRoute()
const searchOpen = ref(false)

const tabs = [
  { key: 'dashboard', label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { key: 'components', label: 'Components', to: '/components', icon: Component },
  { key: 'tokens', label: 'Tokens', to: '/tokens', icon: Layers },
  { key: 'settings', label: 'Settings', to: '/settings', icon: Settings },
]

const sources = [
  { label: 'GitHub repository', href: '#', icon: Github, avatarBg: '#f4f4f5', avatarColor: '#52525b' },
  { label: 'Figma design system', href: '#', icon: Figma, avatarBg: '#f4f4f5', avatarColor: '#52525b' },
]

function isActive(key: string) {
  return route.path === `/${key}`
}

function openSearch() {
  searchOpen.value = true
}

// ⌘K shortcut
onMounted(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      searchOpen.value = !searchOpen.value
    }
  }
  window.addEventListener('keydown', handler)
  onUnmounted(() => window.removeEventListener('keydown', handler))
})
</script>

<style scoped>
.search-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  background: none;
  color: #a1a1aa;
  border-radius: 7px;
  cursor: pointer;
  transition: all 120ms ease;
}
.search-icon-btn:hover {
  color: #3F3F46;
  background: #F4F4F5;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 10px;
  font-size: 13px;
  font-weight: 500;
  color: #666;
  text-decoration: none;
  border-radius: 7px;
  transition: all 120ms ease;
  letter-spacing: -0.1px;
  background: none;
}
.nav-item:hover {
  color: #3F3F46;
  background: #f0f0f0;
}
.nav-item--active {
  font-weight: 600;
  color: #1a1a1a;
  background: #f0f0f0;
}
.source-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 6px 8px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  text-decoration: none;
  border-radius: 10px;
  transition: all 120ms ease;
  cursor: pointer;
}
.source-item:hover {
  color: #3F3F46;
  background: #f0f0f0;
}
.source-avatar {
  width: 20px;
  height: 20px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.scan-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10px 24px;
  font-size: 13px;
  font-weight: 600;
  color: #FFFFFF;
  background: #1a1a1a;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background 120ms ease;
  width: 100%;
  font-family: inherit;
}
</style>
