<template>
  <button
    class="inline-flex items-center gap-[4px] whitespace-nowrap transition-all duration-[120ms] ease-in-out"
    :style="pillStyle"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  active?: boolean
  variant?: 'default' | 'brand' | 'success' | 'warning' | 'error'
}>(), {
  active: false,
  variant: 'default',
})

defineEmits(['click'])

const colors: Record<string, { bg: string; color: string; border: string }> = {
  default: { bg: '#F4F4F5', color: '#71717A', border: 'transparent' },
  brand: { bg: '#F5F5F5', color: '#2C2C2E', border: '#D4D4D4' },
  success: { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
  warning: { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
  error: { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
}

const pillStyle = computed(() => {
  const v = props.active ? 'brand' : props.variant
  const c = colors[v]
  return {
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 500,
    background: c.bg,
    color: c.color,
    border: `1px solid ${c.border}`,
    cursor: 'default',
  }
})
</script>
