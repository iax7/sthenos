<script setup>
import { useToasts } from '../composables/useToasts.js'
const { toasts, removeToast } = useToasts()
</script>

<template>
  <div v-if="toasts.length" class="fixed top-4 right-4 flex flex-col gap-2 z-50" aria-live="polite" aria-atomic="true">
    <div
      v-for="t in toasts"
      :key="t.id"
      :class="[
        'px-4 py-3 rounded-md shadow-md border text-sm font-medium bg-white text-gray-800 flex items-center gap-3',
        t.variant==='success' ? 'border-green-300 bg-green-50 text-green-800' : '',
        t.variant==='error' ? 'border-red-300 bg-red-50 text-red-800' : ''
      ]"
    >
      <span class="grow">{{ t.message }}</span>
      <button type="button" class="icon-btn" aria-label="Close" @click="removeToast(t.id)">✕</button>
    </div>
  </div>
</template>
