<template>
  <div class="flex items-center gap-[8px]">
    <div
      class="w-[24px] h-[24px] rounded-[6px] flex items-center justify-center"
      style="background: linear-gradient(135deg, #52525B, #2C2C2E)"
    >
      <Gauge :size="13" color="#FFF" :stroke-width="2.5" />
    </div>
    <span
      class="text-[14px] tracking-[-0.4px]"
      :style="{ fontWeight: 660, color: light ? '#F4F4F5' : '#09090B' }"
    >
      TokenLens
    </span>
  </div>
</template>

<script setup lang="ts">
import { Gauge } from 'lucide-vue-next'

withDefaults(defineProps<{ light?: boolean }>(), { light: false })
</script>
