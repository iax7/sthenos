<script setup>
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import ExerciseTestForm from "@/components/ExerciseTestForm.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import { ArrowLeftCircleIcon } from '@heroicons/vue/24/outline'
import { useProfileStore } from '@/composables/useProfileStore.js';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { tests } = useProfileStore();

const isEdit = route.name === "exercise-edit";
const index = isEdit ? Number(route.params.index) : null;
const test = isEdit && tests.value[index] ? { ...tests.value[index] } : null;

function goBack() {
  router.push("/");
}
</script>

<template>
  <div class="max-w-4xl">
    <div class="mb-4 flex items-center justify-between">
      <h2>
        {{ isEdit ? t('exercise.editor.titleEdit') : t('exercise.editor.titleNew') }}
      </h2>
      <BaseButton variant="secondary" type="button" @click="goBack">
        <ArrowLeftCircleIcon class="size-5 mr-1" />
        <span>{{ t('app.back') }}</span>
      </BaseButton>
    </div>
    <ExerciseTestForm
      v-if="isEdit && test"
      mode="edit"
      :index="index"
      :test="test"
      @done="goBack"
      @cancel="goBack"
    />
    <ExerciseTestForm v-else mode="create" @done="goBack" @cancel="goBack" />
  </div>
</template>
