<script setup>
const buildTime = new Date(__BUILD_TIME__).toLocaleString('sv-SE', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
}).replace(',', '')
</script>

<template>
  <div class="text-center py-4 border-t border-gray-200">
    <p class="text-xs text-gray-400 font-mono">
      v{{ buildTime }}
    </p>
  </div>
</template>

