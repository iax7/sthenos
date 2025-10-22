<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'primary' },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  class: { type: String, default: '' }
})

const classes = computed(() => {
  const base = 'btn'
  let variantClass = ''
  if (props.variant === 'danger') variantClass = ' btn-danger'
  else if (props.variant === 'ghost') variantClass = ' btn-ghost'
  return base + variantClass + (props.class ? ' ' + props.class : '')
})
</script>
<template>
  <button :type="props.type" :disabled="props.disabled" :class="classes">
    <slot />
  </button>
</template>
