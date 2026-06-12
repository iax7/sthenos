<script setup>
import { computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseInput from './BaseInput.vue'

const props = defineProps({
  label: { type: String, required: true },
  count: { type: [Number, String], default: '' },
  placeholder: { type: String, default: '' },
  version: { type: String, default: '' },
  versions: { type: Array, default: () => [] },
  min: { type: Number, default: 0 },
})

const emit = defineEmits(['update:count', 'update:version'])

const numberValue = computed({
  get: () => props.count,
  set: (v) => emit('update:count', v),
})

const versionValue = computed({
  get: () => props.version,
  set: (v) => emit('update:version', v),
})

const { t } = useI18n()

const hasSingleVersion = computed(() => props.versions.length === 1)

function selectFirstIfEmpty() {
  if (!versionValue.value && props.versions.length) {
    const first = props.versions[0]
    const val = typeof first === 'string' ? first : first.value
    emit('update:version', val)
  }
}

onMounted(selectFirstIfEmpty)
watch(
  () => props.versions,
  () => selectFirstIfEmpty(),
)
</script>

<template>
  <div>
    <label class="block text-base md:text-lg font-semibold text-gray-800 mb-1">{{ label }}</label>
    <div class="flex flex-col gap-2 md:flex-row md:gap-3 md:items-center">
      <div class="w-full md:w-28 md:shrink-0">
        <BaseInput v-model="numberValue" :min="min" type="number" :placeholder="placeholder" />
      </div>
      <div v-if="versions.length"
        class="inline-flex rounded-md border border-gray-300 overflow-hidden bg-white shadow-sm w-full md:flex-1">
        <button v-for="v in versions" :key="typeof v === 'string' ? v : v.value" type="button"
          class="flex-1 px-1 md:px-2 py-2 text-xs font-medium transition border-r border-gray-300 last:border-r-0 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          :class="versionValue === (typeof v === 'string' ? v : v.value)
            ? (typeof v === 'string' ? v : v.value) === 'c' ? 'bg-emerald-600 text-white' : 'bg-orange-500 text-white'
            : hasSingleVersion ? 'bg-white text-gray-700' : 'bg-white text-gray-700 hover:bg-gray-50'"
          :disabled="hasSingleVersion"
          @click="!hasSingleVersion && (versionValue = typeof v === 'string' ? v : v.value)">
          {{ typeof v === 'string' ? v : v.labelKey ? t(v.labelKey) : v.label }}
        </button>
      </div>
    </div>
  </div>
</template>
