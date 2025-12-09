<script setup>
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import AppCard from "@/components/ui/AppCard.vue";
import BaseInput from "@/components/ui/BaseInput.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import ExerciseMetricInput from "@/components/ui/ExerciseMetricInput.vue";
import { useProfileStore } from "@/composables/useProfileStore.js";
import { useToasts } from "@/composables/useToasts.js";
import {
  PULL_UP_VERSIONS,
  PUSH_UP_VERSIONS,
  SQUAT_VERSIONS,
  VUP_VERSIONS,
  BURPEE_VERSIONS,
} from "@/services/exerciseVersions.js";

const { t } = useI18n();

const props = defineProps({
  mode: { type: String, default: "create" }, // 'create' | 'edit'
  index: { type: Number, default: null }, // required for edit
  test: { type: Object, default: null },
});
const emit = defineEmits(["done", "cancel"]);
const { pushToast } = useToasts();
const { appendTest, updateTest, createTestMetric } = useProfileStore();

function todayISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  const localDate = new Date(now.getTime() - offset);
  return localDate.toISOString().slice(0, 10);
}

function initValue(path, defaultValue = "") {
  if (props.mode !== "edit" || !props.test) return defaultValue;
  const keys = path.split(".");
  let value = props.test;
  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) return defaultValue;
  }
  return value ?? defaultValue;
}

// State
const date = ref(initValue("date", todayISO()));
const pullUps = ref(initValue("pullup.reps", ""));
const pullUpsVersion = ref(initValue("pullup.version", ""));
const pushUps = ref(initValue("pushup.reps", ""));
const pushUpsVersion = ref(initValue("pushup.version", ""));
const squats = ref(initValue("squats.reps", ""));
const squatsVersion = ref(initValue("squats.version", ""));
const vups = ref(initValue("vups.reps", ""));
const vupsVersion = ref(initValue("vups.version", ""));
const burpees = ref(initValue("burpees.reps", ""));
const burpeesVersion = ref(initValue("burpees.version", ""));
const laps = ref(initValue("cooper", ""));

watch(
  () => props.test,
  (t) => {
    if (props.mode === "edit" && t) {
      date.value = t.date;
      pullUps.value = t.pullup?.reps ?? t.pullUps ?? 0;
      pullUpsVersion.value = t.pullup?.version ?? t.pullUpsVersion ?? "";
      pushUps.value = t.pushup?.reps ?? t.pushUps ?? 0;
      pushUpsVersion.value = t.pushup?.version ?? t.pushUpsVersion ?? "";
      squats.value = t.squats?.reps ?? t.squats ?? 0;
      squatsVersion.value = t.squats?.version ?? t.squatsVersion ?? "";
      vups.value = t.vups?.reps ?? t.vups ?? 0;
      vupsVersion.value = t.vups?.version ?? t.vupsVersion ?? "";
      burpees.value = t.burpees?.reps ?? t.burpees ?? 0;
      burpeesVersion.value = t.burpees?.version ?? t.burpeesVersion ?? "";
      laps.value = t.cooper ?? t.laps ?? 0;
    }
  },
);

function hasPositiveValue() {
  // Checks if at least one input value is > 0
  const values = [
    Number(pullUps.value),
    Number(pushUps.value),
    Number(squats.value),
    Number(vups.value),
    Number(burpees.value),
    Number(laps.value),
  ];
  return values.some((v) => v > 0);
}

const canSave = computed(() => {
  const dateOk = date.value && /\d{4}-\d{2}-\d{2}/.test(date.value);
  return dateOk && hasPositiveValue();
});

function save() {
  if (!canSave.value) return;
  const payload = {
    date: date.value,
    pullup: createTestMetric(pullUps.value, pullUpsVersion.value),
    pushup: createTestMetric(pushUps.value, pushUpsVersion.value),
    squats: createTestMetric(squats.value, squatsVersion.value),
    vups: createTestMetric(vups.value, vupsVersion.value),
    burpees: createTestMetric(burpees.value, burpeesVersion.value),
    cooper: Number(laps.value) || 0,
  };
  if (props.mode === "edit") {
    const updated = updateTest(props.index, payload);
    if (updated) {
      pushToast("Test updated", "success");
    } else {
      pushToast("Failed to update test", "error");
    }
  } else {
    const created = appendTest(payload);
    if (created) {
      pushToast("Test created", "success");
    } else {
      pushToast("Failed to create test", "error");
    }
  }
  emit("done");
}
</script>

<template>
  <AppCard>
    <form @submit.prevent="save" class="space-y-6">
      <!-- Date -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ t('exercise.editor.date') }}
        </label>
        <BaseInput v-model="date" type="date" required class="w-full" />
      </div>

      <!-- Cooper Test -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ t("exercise.editor.cooperLaps") }}
        </label>
        <BaseInput
          v-model="laps"
          type="number"
          min="0"
          step="0.5"
          :placeholder="t('exercise.editor.count')"
          class="w-full"
        />
      </div>

      <!-- Exercises -->
      <div class="space-y-6">
        <ExerciseMetricInput
          label="Pull Ups"
          :placeholder="t('exercise.editor.count')"
          v-model:count="pullUps"
          v-model:version="pullUpsVersion"
          :versions="PULL_UP_VERSIONS"
        />
        <ExerciseMetricInput
          label="Push Ups"
          :placeholder="t('exercise.editor.count')"
          v-model:count="pushUps"
          v-model:version="pushUpsVersion"
          :versions="PUSH_UP_VERSIONS"
        />
        <ExerciseMetricInput
          label="Squats"
          :placeholder="t('exercise.editor.count')"
          v-model:count="squats"
          v-model:version="squatsVersion"
          :versions="SQUAT_VERSIONS"
        />
        <ExerciseMetricInput
          label="V-Ups"
          :placeholder="t('exercise.editor.count')"
          v-model:count="vups"
          v-model:version="vupsVersion"
          :versions="VUP_VERSIONS"
        />
        <ExerciseMetricInput
          label="Burpees"
          :placeholder="t('exercise.editor.count')"
          v-model:count="burpees"
          v-model:version="burpeesVersion"
          :versions="BURPEE_VERSIONS"
        />
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-3 pt-2">
        <BaseButton variant="secondary" type="button" @click="emit('cancel')">
          {{ t("app.cancel") }}
        </BaseButton>
        <BaseButton type="submit" :disabled="!canSave">
          {{ props.mode === "edit" ? t("app.update") : t("app.save") }}
        </BaseButton>
      </div>
    </form>
  </AppCard>
</template>
