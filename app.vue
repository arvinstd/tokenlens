<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
useHead({
  script: [
    { src: 'https://mcp.figma.com/mcp/html-to-design/capture.js', async: true }
  ]
})
</script>
