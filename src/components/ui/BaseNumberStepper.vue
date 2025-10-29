<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: { type: [Number, String], default: 0 },
  min: { type: Number, default: 0 },
  max: { type: Number, default: Infinity },
  step: { type: Number, default: 1 },
  disabled: { type: Boolean, default: false },
  dark: { type: Boolean, default: false },
  label: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue"]);

function normalize(val) {
  const n = typeof val === "string" ? parseInt(val, 10) : val;
  return isNaN(n) ? 0 : n;
}

const current = computed(() => normalize(props.modelValue));

function clamp(v) {
  return Math.min(props.max, Math.max(props.min, v));
}

function set(v) {
  if (props.disabled) return;
  emit("update:modelValue", clamp(v));
}

function inc() {
  set(current.value + props.step);
}

function dec() {
  set(current.value - props.step);
}
</script>

<template>
  <div
    :class="[dark ? 'number-stepper-dark' : 'number-stepper', 'w-full']"
    :aria-label="label"
  >
    <button
      type="button"
      class="number-stepper-btn number-stepper-btn-fixed"
      :disabled="disabled || current <= min"
      @click="dec"
      aria-label="Decrease"
    >
      -
    </button>
    <input
      class="number-stepper-input"
      type="number"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      :value="current"
      @input="set($event.target.value)"
      @blur="set($event.target.value)"
      @keydown.enter.prevent="set($event.target.value)"
      aria-label="Numeric value"
    />
    <button
      type="button"
      class="number-stepper-btn number-stepper-btn-fixed"
      :disabled="disabled || current >= max"
      @click="inc"
      aria-label="Increase"
    >
      +
    </button>
  </div>
</template>
