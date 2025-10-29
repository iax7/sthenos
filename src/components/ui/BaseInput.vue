<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: { type: [String, Number], default: "" },
  type: { type: String, default: "text" },
  placeholder: { type: String, default: "" },
  disabled: { type: Boolean, default: false },
  min: { type: [String, Number], default: undefined },
  required: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

function onInput(e) {
  emit("update:modelValue", e.target.value);
}

const baseClasses = computed(() => "form-input");
</script>
<template>
  <input
    :type="props.type"
    :value="props.modelValue"
    :placeholder="props.placeholder"
    :disabled="props.disabled"
    :min="props.min"
    :required="props.required"
    @input="onInput"
    :class="baseClasses"
  />
</template>
