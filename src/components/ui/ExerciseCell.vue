<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { NoSymbolIcon } from '@heroicons/vue/24/solid'

const props = defineProps({
  value: { type: Number, default: null },
  version: { type: Object, default: null },
})

const { t } = useI18n()

const versionLabel = computed(() => {
  if (!props.version || !props.version.labelKey) return null
  return t(props.version.labelKey)
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
    <div class="flex w-full items-center justify-end group relative">
      <NoSymbolIcon
        v-if="!isNaN(Number(value)) && Number(value) <= 0"
        class="size-5 text-red-400/50"
      />
      <span v-else-if="!isNaN(Number(value))" class="flex items-center cursor-help"
        >{{ formatValue(value) }}<slot
      /></span>
      <span v-else class="text-red-400/50">-</span>

      <div
        v-if="versionLabel && !isNaN(Number(value)) && Number(value) > 0"
        class="pointer-events-none absolute -top-8 right-0 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs font-medium text-gray-100 opacity-0 transition-opacity group-hover:opacity-100 z-10"
      >
        {{ versionLabel }}
      </div>
    </div>
  </td>
</template>
