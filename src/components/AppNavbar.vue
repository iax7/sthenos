<script setup>
import { ref, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useToasts } from '@/composables/useToasts.js'
import { useProfileStore } from '@/composables/useProfileStore.js'
import { TrashIcon, Bars3Icon, CogIcon } from '@heroicons/vue/24/outline'

const emit = defineEmits(['clear', 'imported'])
const { t } = useI18n()

  const menuOpen = ref(false)
const router = useRouter()
const { pushToast } = useToasts()
const { clearProfile } = useProfileStore()

function goToSettings() {
  menuOpen.value = false
  router.push({ name: 'settings' })
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

  // fetchUrl removed: moved to Settings view

function confirmClear() {
  if (window.confirm(t('nav.clearConfirm'))) {
    clearProfile()
    emit('clear')
    menuOpen.value = false
    pushToast(t('nav.localDataCleared'), 'success')
    router.push('/profile')
  }
}

function closeOnOutside(e) {
  if (!menuOpen.value) return
  const menuEl = document.getElementById('global-menu-dropdown')
  const btnEl = document.getElementById('global-menu-button')
  if (menuEl && !menuEl.contains(e.target) && btnEl && !btnEl.contains(e.target)) {
    menuOpen.value = false
  }
}
document.addEventListener('click', closeOnOutside)
onUnmounted(() => document.removeEventListener('click', closeOnOutside))
</script>

<template>
  <nav class="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/90 backdrop-blur">
    <div class="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
      <h1 class="text-2xl font-bold tracking-wide">{{ t('nav.title') }}</h1>
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
          <Bars3Icon class="size-7"></Bars3Icon>
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
                @click="goToSettings"
              >
                <CogIcon class="h-5 w-5" />
                <span>{{ t('nav.settings') }}</span>
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
                <span>{{ t('nav.clear') }}</span>
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
