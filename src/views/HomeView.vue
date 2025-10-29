<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { loadProfile, deleteTest } from "@/services/profileStore.js";
import { useRouter } from "vue-router";
import DashboardTable from "@/components/DashboardTable.vue";
import DashboardChart from "@/components/DashboardChart.vue";
import DashboardHeader from "@/components/DashboardHeader.vue";
import { useToasts } from "@/composables/useToasts.js";

const profile = ref(loadProfile());
const tests = ref(profile.value?.tests || []);
const { pushToast } = useToasts();
const router = useRouter();

const { t } = useI18n();

function refresh() {
  profile.value = loadProfile();
  tests.value = profile.value?.tests || [];
}

function newEntry() {
  router.push("/exercise/new");
}
function onEditTest(i) {
  router.push(`/exercise/edit/${i}`);
}
function onDeleteTest(i) {
  if (!confirm(t("dashboard.deleteConfirm"))) return;
  const ok = deleteTest(i);
  if (ok) {
    refresh();
    pushToast(t("dashboard.deleteSuccess"), "success");
  } else {
    pushToast(t("dashboard.deleteFailure"), "error");
  }
}

onMounted(() => {
  window.addEventListener("profile-updated", refresh);
});
onUnmounted(() => {
  window.removeEventListener("profile-updated", refresh);
});
</script>

<template>
  <div class="w-full max-w-4xl px-4">
    <DashboardHeader :profile="profile" />
    <DashboardTable
      :tests="tests"
      @edit="onEditTest"
      @delete="onDeleteTest"
      @new="newEntry"
    />
    <DashboardChart v-if="tests.length > 0" :tests="tests" />
  </div>
</template>
