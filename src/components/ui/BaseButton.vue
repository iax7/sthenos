<script setup>
const props = defineProps({
  variant: { type: String, default: 'primary' },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  class: { type: String, default: '' },
})

const base =
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none px-4 py-2 shadow-md'
</script>

<template>
  <button
    :type="props.type"
    :disabled="props.disabled"
    :class="{
      [base]: true,
      'bg-blue-600 text-white hover:bg-blue-700': props.variant === 'primary',
      'bg-gray-200 text-gray-700 hover:bg-gray-300': props.variant === 'secondary',
      'bg-red-600 text-white hover:bg-red-700': props.variant === 'danger',
    }"
  >
    <slot />
  </button>
</template>
