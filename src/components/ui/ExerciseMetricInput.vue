<script setup>
import { computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseInput from './BaseInput.vue'
import BaseSelect from './BaseSelect.vue'

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
  <div class="space-y-2">
    <label class="form-label">{{ label }}</label>
    <div class="grid grid-cols-2 gap-3">
      <BaseInput v-model="numberValue" :min="min" type="number" :placeholder="placeholder" />
      <BaseSelect v-model="versionValue" required :disabled="versions.length <= 1">
        <option v-for="v in versions" :key="typeof v === 'string' ? v : v.value"
          :value="typeof v === 'string' ? v : v.value">
          {{ typeof v === 'string' ? v : v.labelKey ? t(v.labelKey) : v.label }}
        </option>
      </BaseSelect>
    </div>
  </div>
</template>
