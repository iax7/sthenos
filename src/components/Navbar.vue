<script setup>
import { ref, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useToasts } from "../composables/useToasts.js";
import {
  getProfileData,
  importProfile,
  clearProfile,
} from "../services/profileStore.js";
import IconMenu from "./icons/IconMenu.vue";
import {
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  TrashIcon,
} from "@heroicons/vue/24/outline";

const emit = defineEmits(["clear", "imported"]);
const { t } = useI18n();

const menuOpen = ref(false);
const fileInput = ref(null);
const router = useRouter();
const { pushToast } = useToasts();

function toggleMenu() {
  menuOpen.value = !menuOpen.value;
}

function downloadProfile() {
  const json = getProfileData();
  const blob = new Blob([json], { type: "application/json" });
  const a = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  a.href = URL.createObjectURL(blob);
  a.download = `profile-${date}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
  menuOpen.value = false;
  pushToast(t("nav.jsonDownloaded"), "success");
}

function triggerUpload() {
  fileInput.value?.click();
}

function handleFileChange(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const result = importProfile(parsed);
      if (result.ok) {
        emit("imported", result.profile);
        pushToast(t("nav.profileImported"), "success");
        if (router.currentRoute.value.path === "/") {
          window.dispatchEvent(new CustomEvent("profile-updated"));
        } else {
          router.push("/");
        }
      } else {
        emit("imported", { error: result.error });
        pushToast(result.error || t("nav.importFailed"), "error");
      }
    } catch (err) {
      emit("imported", { error: t("nav.invalidJson") });
      pushToast(t("nav.invalidJson"), "error");
    }
    e.target.value = "";
    menuOpen.value = false;
  };
  reader.readAsText(file);
}

function confirmClear() {
  if (window.confirm(t("nav.clearConfirm"))) {
    clearProfile();
    emit("clear");
    menuOpen.value = false;
    pushToast(t("nav.localDataCleared"), "success");
    router.push("/profile");
  }
}

function closeOnOutside(e) {
  if (!menuOpen.value) return;
  const menuEl = document.getElementById("global-menu-dropdown");
  const btnEl = document.getElementById("global-menu-button");
  if (
    menuEl &&
    !menuEl.contains(e.target) &&
    btnEl &&
    !btnEl.contains(e.target)
  ) {
    menuOpen.value = false;
  }
}
document.addEventListener("click", closeOnOutside);
onUnmounted(() => document.removeEventListener("click", closeOnOutside));
</script>

<template>
  <nav
    class="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/90 backdrop-blur"
  >
    <div class="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
      <h1 class="text-2xl font-bold tracking-wide">{{ t("nav.title") }}</h1>
      <div class="relative">
        <button
          id="global-menu-button"
          type="button"
          class="icon-btn"
          @click="toggleMenu"
          aria-haspopup="true"
          :aria-expanded="menuOpen"
          title="Menu"
        >
          <span class="sr-only">Open menu</span>
          <IconMenu />
        </button>
        <div
          v-if="menuOpen"
          id="global-menu-dropdown"
          class="absolute right-0 z-50 w-44 rounded-md border border-gray-200 bg-white shadow-sm"
        >
          <ul class="py-1 text-sm">
            <li>
              <button
                type="button"
                class="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-gray-100"
                @click="downloadProfile"
              >
                <ArrowDownTrayIcon class="h-5 w-5" />
                <span>{{ t("nav.download") }}</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                class="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-gray-100"
                @click="triggerUpload"
              >
                <ArrowUpTrayIcon class="h-5 w-5" />
                <span>{{ t("nav.upload") }}</span>
              </button>
            </li>
            <hr class="my-1 border-gray-200" />
            <li>
              <button
                type="button"
                class="flex w-full items-center gap-2 px-3 py-2 text-left text-red-600 hover:bg-red-100"
                @click="confirmClear"
              >
                <TrashIcon class="h-5 w-5" />
                <span>{{ t("nav.clear") }}</span>
              </button>
            </li>
          </ul>
        </div>
        <input
          ref="fileInput"
          type="file"
          accept="application/json"
          class="hidden"
          @change="handleFileChange"
        />
      </div>
    </div>
  </nav>
</template>
