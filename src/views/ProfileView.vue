<script setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useToasts } from "@/composables/useToasts.js";
import { useProfileStore } from "@/composables/useProfileStore.js";
import { useRouter } from "vue-router";
import Card from "@/components/ui/Card.vue";
import BaseInput from "@/components/ui/BaseInput.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import BaseNumberStepper from "@/components/ui/BaseNumberStepper.vue";

const { t } = useI18n();
const { pushToast } = useToasts();
const router = useRouter();
const { profile, saveProfile } = useProfileStore();

// Reactive state
const name = ref("");
const gender = ref("");
const age = ref("");
const isEditing = ref(false);

// Initialize from store
if (profile.value) {
  name.value = profile.value.name;
  gender.value = profile.value.gender;
  age.value = profile.value.age;
  isEditing.value = true;
}

const canSave = computed(
  () =>
    name.value.trim() &&
    (gender.value === "M" || gender.value === "F") &&
    age.value,
);

function save() {
  if (!canSave.value) return;
  saveProfile({ name: name.value, gender: gender.value, age: age.value });
  pushToast(
    t(isEditing.value ? "profile.updateSuccess" : "profile.saveSuccess"),
    "success",
  );
  router.push("/");
}

function cancel() {
  router.push("/");
}
</script>

<template>
  <Card>
    <form @submit.prevent="save" class="space-y-4">
      <div class="flex flex-col">
        <label class="form-label">{{ t("profile.name") }}</label>
        <BaseInput
          v-model="name"
          :placeholder="t('profile.namePlaceholder')"
          required
        />
      </div>
      <div class="flex flex-col">
        <label class="form-label">{{ t("profile.gender") }}</label>
        <div class="flex gap-2">
          <label class="relative flex-1 cursor-pointer">
            <input
              type="radio"
              class="peer opacity-0 absolute"
              value="M"
              v-model="gender"
              required
            />
            <span
              class="block rounded-lg border px-4 py-2 text-center transition
                border-gray-200 bg-gray-50 hover:bg-gray-100
                peer-checked:border-blue-500 peer-checked:bg-blue-50/80 peer-checked:shadow-sm
                font-medium text-gray-800"
            >
              {{ t("profile.male") }}
            </span>
          </label>
          <label class="relative flex-1 cursor-pointer">
            <input
              type="radio"
              class="peer opacity-0 absolute"
              value="F"
              v-model="gender"
              required
            />
            <span
              class="block rounded-lg border px-4 py-2 text-center transition
                border-gray-200 bg-gray-50 hover:bg-gray-100
                peer-checked:border-blue-500 peer-checked:bg-blue-50/80 peer-checked:shadow-sm
                font-medium text-gray-800"
            >
              {{ t("profile.female") }}
            </span>
          </label>
        </div>
      </div>
      <div class="flex flex-col">
        <label class="form-label">{{ t("profile.age") }}</label>
        <BaseNumberStepper
          v-model="age"
          :min="11"
          :max="120"
          :step="1"
          :label="t('profile.age')"
        />
      </div>
      <div class="flex justify-end gap-2">
        <BaseButton type="submit" :disabled="!canSave">{{
          isEditing ? t("app.update") : t("app.save")
        }}</BaseButton>
        <BaseButton
          v-if="isEditing"
          type="button"
          variant="secondary"
          @click="cancel"
          >{{ t("app.cancel") }}</BaseButton
        >
      </div>
    </form>
  </Card>
</template>
