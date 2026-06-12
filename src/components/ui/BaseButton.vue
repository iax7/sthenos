<script setup>
const props = defineProps({
  variant: { type: String, default: 'primary' },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  class: { type: String, default: '' },
})

const base =
  'inline-flex items-center justify-center font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none'
const sizes = {
  default: 'px-4 py-2 shadow-md rounded-md',
  icon: 'size-9 border border-gray-200 rounded-lg text-sm text-gray-500',
}
</script>

<template>
  <button :type="props.type" :disabled="props.disabled" :class="[
    base,
    sizes[props.variant === 'icon' ? 'icon' : 'default'],
    {
      'bg-blue-600 text-white hover:bg-blue-700': props.variant === 'primary',
      'bg-gray-200 text-gray-700 hover:bg-gray-300': props.variant === 'secondary',
      'bg-red-600 text-white hover:bg-red-700': props.variant === 'danger',
      'text-gray-500 hover:text-gray-700 focus:ring-2 focus:ring-blue-500': props.variant === 'icon',
    },
    props.class
  ]">
    <slot />
  </button>
</template>
