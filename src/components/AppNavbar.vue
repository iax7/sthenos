<script setup>
import { ref, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Bars3Icon, CogIcon, HomeIcon, InformationCircleIcon, RectangleStackIcon } from '@heroicons/vue/24/outline'

const { t } = useI18n()

const menuOpen = ref(false)

function toggleMenu() {
  menuOpen.value = !menuOpen.value
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
        <button id="global-menu-button" type="button" class="icon-btn" @click="toggleMenu" aria-haspopup="true"
          :aria-expanded="menuOpen" title="Menu">
          <span class="sr-only">Open menu</span>
          <Bars3Icon class="size-7"></Bars3Icon>
        </button>
        <div v-if="menuOpen" id="global-menu-dropdown"
          class="absolute right-0 z-50 w-44 rounded-md border border-gray-200 bg-white shadow-sm">
          <ul class="py-1 text-sm">

            <li>
              <RouterLink :to="{ name: 'home' }"
                class="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-gray-100" @click="menuOpen = false">
                <HomeIcon class="h-5 w-5" />
                <span>{{ t('nav.home') }}</span>
              </RouterLink>
            </li>
            <li>
              <RouterLink :to="{ name: 'tests' }"
                class="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-gray-100" @click="menuOpen = false">
                <RectangleStackIcon class="h-5 w-5" />
                <span>{{ t('nav.tests') }}</span>
              </RouterLink>
            </li>
            <li>
              <RouterLink :to="{ name: 'info' }"
                class="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-gray-100" @click="menuOpen = false">
                <InformationCircleIcon class="h-5 w-5" />
                <span>{{ t('nav.info') }}</span>
              </RouterLink>
            </li>
            <hr class="my-1 border-gray-200" />
            <li>
              <RouterLink :to="{ name: 'settings' }"
                class="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-gray-100" @click="menuOpen = false">
                <CogIcon class="h-5 w-5" />
                <span>{{ t('nav.settings') }}</span>
              </RouterLink>
            </li>

          </ul>
        </div>
        <input ref="fileInput" type="file" accept="application/json" class="hidden" @change="handleFileChange" />
      </div>
    </div>
  </nav>
</template>
