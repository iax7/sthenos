<script setup>
const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  min: { type: [String, Number], default: undefined },
  required: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

function onInput(e) {
  emit('update:modelValue', e.target.value)
}
</script>
<template>
  <input :type="props.type" :value="props.modelValue" :placeholder="props.placeholder" :disabled="props.disabled"
    :min="props.min" :required="props.required" @input="onInput"
    class="px-3 py-2 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed w-full" />
</template>
