<template>
  <div class="rounded-md overflow-hidden" style="border: 1px solid #E4E4E7">
    <!-- Header -->
    <div
      class="flex items-center justify-between"
      style="padding: 6px 16px; background: #1E1E20; border-bottom: 1px solid rgba(255,255,255,0.06)"
    >
      <span class="text-[11px] font-medium text-dk-text3">{{ language }}</span>
      <button
        class="flex items-center gap-[4px] text-dk-text3 text-[11px] p-[4px] bg-transparent border-none cursor-pointer"
        @click="copyCode"
      >
        <Check v-if="copied" :size="11" color="#16A34A" />
        <Copy v-else :size="11" />
        {{ copied ? 'Copied' : 'Copy' }}
      </button>
    </div>
    <!-- Code -->
    <pre
      class="m-0 overflow-x-auto text-[12px] leading-[1.6] font-mono text-code-text"
      style="padding: 16px; background: #1E1E20"
      v-html="highlightedCode"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Copy, Check } from 'lucide-vue-next'

const props = defineProps<{
  code: string
  language: string
}>()

const copied = ref(false)

function copyCode() {
  navigator.clipboard.writeText(props.code)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

const highlightedCode = computed(() => {
  return props.code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .split('\n')
    .map((line) => {
      let h = line
      // Comments
      h = h.replace(/(\/\/.*$|&lt;!--.*?--&gt;)/g, '<span style="color:#52525B">$1</span>')
      // Strings
      h = h.replace(/(".*?"|'.*?'|`.*?`)/g, '<span style="color:#86EFAC">$1</span>')
      // Tags
      h = h.replace(/(&lt;\/?)([\w-]+)/g, '$1<span style="color:#7DD3FC">$2</span>')
      // Keywords
      h = h.replace(
        /\b(import|from|export|default|const|let|function|return|template|script|style|setup|defineProps|ref|computed)\b/g,
        '<span style="color:#C084FC">$1</span>',
      )
      // Attributes
      h = h.replace(/\s([\w-]+)=/g, ' <span style="color:#FCA5A5">$1</span>=')
      h = h.replace(/:([\w-]+)=/g, ':<span style="color:#FCA5A5">$1</span>=')
      return h
    })
    .join('\n')
})
</script>
