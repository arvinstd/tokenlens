<template>
  <button
    :disabled="disabled"
    class="inline-flex items-center gap-[8px] transition-all duration-[120ms] ease-in-out"
    :style="btnStyle"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  primary?: boolean
  ghost?: boolean
  disabled?: boolean
}>(), {
  primary: false,
  ghost: false,
  disabled: false,
})

defineEmits(['click'])

const btnStyle = computed(() => ({
  padding: '8px 16px',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 500,
  minHeight: '40px',
  background: props.primary ? '#2C2C2E' : 'transparent',
  color: props.primary ? '#FFF' : '#3F3F46',
  border: props.primary ? 'none' : '1px solid #E4E4E7',
  cursor: props.disabled ? 'not-allowed' : 'pointer',
  opacity: props.disabled ? 0.5 : 1,
}))
</script>
