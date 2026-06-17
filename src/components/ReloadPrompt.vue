<script setup>
import { useRegisterSW } from 'virtual:pwa-register/vue'

// Register SW with autoUpdate — new versions activate automatically.
// Listen for controllerchange to reload the page so stale JS is replaced
// and links/routes keep working. Guard prevents infinite reload loops.
let refreshing = false
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return
    refreshing = true
    window.location.reload()
  })
}

useRegisterSW()
</script>

<template>
  <span aria-hidden="true" style="display: none" />
</template>
