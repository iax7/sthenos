<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { loadProfile, deleteTest } from "../services/profileStore.js";
import { useRouter } from "vue-router";
import DashboardTable from "./DashboardTable.vue";
import DashboardChart from "./DashboardChart.vue";
import DashboardHeader from "./DashboardHeader.vue";
import { useToasts } from "../composables/useToasts.js";

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
  if (!confirm("Delete this test entry?")) return;
  const ok = deleteTest(i);
  if (ok) {
    refresh();
    pushToast("Test deleted", "success");
  } else {
    pushToast("Failed to delete test", "error");
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
    <DashboardChart :tests="tests" />
  </div>
</template>
