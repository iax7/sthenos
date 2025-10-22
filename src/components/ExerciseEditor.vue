<script setup>
import { useRoute, useRouter } from "vue-router";
import ExerciseTestForm from "./ExerciseTestForm.vue";
import { loadProfile } from "../services/profileStore.js";
import BaseButton from "./ui/BaseButton.vue";
import Card from "./ui/Card.vue";
import { ref } from "vue";

const route = useRoute();
const router = useRouter();
const profile = ref(loadProfile());
const tests = ref(profile.value?.tests || []);

const isEdit = route.name === "exercise-edit";
const index = isEdit ? Number(route.params.index) : null;
const test = isEdit && tests.value[index] ? { ...tests.value[index] } : null;

function goBack() {
  router.push("/dashboard");
}
</script>

<template>
  <div class="mx-auto w-full max-w-3xl px-4 py-6">
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-xl font-semibold">
        {{ isEdit ? "Edit Exercise" : "New Exercise" }}
      </h1>
      <BaseButton variant="secondary" type="button" @click="goBack"
        >Back</BaseButton
      >
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
    <div v-if="isEdit && !test" class="mt-6">
      <Card>
        <p class="text-sm text-red-600">
          Invalid test index.
          <button class="underline" @click="goBack">Return</button>
        </p>
      </Card>
    </div>
  </div>
</template>
