<script setup>
import { computed } from "vue";

const props = defineProps({
  variant: { type: String, default: "primary" },
  type: { type: String, default: "button" },
  disabled: { type: Boolean, default: false },
  class: { type: String, default: "" },
});

const classes = computed(() => {
  const base =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none px-4 py-2 shadow-md";
  let variantClass = " bg-blue-600 text-white hover:bg-blue-700";
  if (props.variant === "secondary")
    variantClass = " bg-gray-200 text-gray-700 hover:bg-gray-300";
  else if (props.variant === "danger")
    variantClass = " bg-red-600 text-white hover:bg-red-700";
  return base + variantClass + (props.class ? " " + props.class : "");
});
</script>
<template>
  <button :type="props.type" :disabled="props.disabled" :class="classes">
    <slot />
  </button>
</template>
