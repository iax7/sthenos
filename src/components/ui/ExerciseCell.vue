<script setup>
import { NoSymbolIcon } from '@heroicons/vue/24/solid'

const props = defineProps({
  value: { type: Number, default: null },
})

function formatValue(val) {
  const num = Number(val)
  if (isNaN(num)) return ''
  return Number.isInteger(num)
    ? num.toLocaleString()
    : num.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
}
</script>

<template>
  <td class="exercise__cell w-21 text-right font-mono">
    <div class="flex w-full items-center justify-end">
      <NoSymbolIcon
        v-if="!isNaN(Number(value)) && Number(value) <= 0"
        class="size-5 text-red-400/50"
      />
      <span v-else-if="!isNaN(Number(value))" class="flex items-center"
        >{{ formatValue(value) }}<slot
      /></span>
      <span v-else class="text-red-400/50">-</span>
    </div>
  </td>
</template>
