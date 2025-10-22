<script setup>
const props = defineProps({
  modelValue: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue'])
function onChange(e){ emit('update:modelValue', e.target.value) }
</script>
<template>
  <select
    :value="props.modelValue"
    :disabled="props.disabled"
    :required="props.required"
    @change="onChange"
    class="form-input"
  >
    <slot />
  </select>
</template>
