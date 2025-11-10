<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps({
  profile: { type: Object, default: () => null },
});

const genderLabel = computed(() => {
  const g = props.profile?.gender;
  if (g === "M") return t("profile.male");
  if (g === "F") return t("profile.female");
  return "";
});
</script>

<template>
  <div>
    <h1 class="text-5xl font-bold tracking-tight text-blue-800 truncate">
      {{ profile?.name }}
    </h1>
    <p class="text-sm text-gray-600" v-if="profile">
      {{ t("profile.gender") }}: {{ genderLabel }} · {{ t("profile.age") }}:
      {{ profile?.age }} ·
      <router-link to="/profile" class="link-edit">{{
        t("profile.edit")
      }}</router-link>
    </p>
  </div>
</template>
