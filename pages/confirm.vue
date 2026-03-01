<template>
  <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #FAFAFA; font-family: 'Inter', system-ui, sans-serif;">
    <div style="text-align: center;">
      <Logo />
      <p style="font-size: 13px; color: #999; margin-top: 16px;">Signing you in...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

const user = useSupabaseUser()

// Watch for user to be set after OAuth redirect, then navigate
watch(user, (newUser) => {
  if (newUser) {
    navigateTo('/dashboard')
  }
}, { immediate: true })
</script>
