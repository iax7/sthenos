<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseButton from '@/components/ui/BaseButton.vue'
import { Bars3Icon, XMarkIcon, CogIcon, HomeIcon, InformationCircleIcon, RectangleStackIcon } from '@heroicons/vue/24/outline'

const { t } = useI18n()

const menuOpen = ref(false)

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function closeMenu() {
  menuOpen.value = false
}
</script>

<template>
  <nav class="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/90 backdrop-blur">
    <div class="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
      <h1 class="text-2xl font-bold tracking-wide">{{ t('nav.title') }}</h1>

      <!-- Desktop dropdown (sm+): positioned relative to button -->
      <div class="relative hidden sm:block">
        <BaseButton variant="icon" @click="toggleMenu" aria-haspopup="true" :aria-expanded="menuOpen" title="Menu">
          <span class="sr-only">Open menu</span>
          <Bars3Icon class="size-7" />
        </BaseButton>
        <Transition enter-active-class="transition duration-150 ease-out" enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
          <div v-if="menuOpen"
            class="absolute right-0 top-full mt-2 w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
            <RouterLink :to="{ name: 'home' }"
              class="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 [&.router-link-exact-active]:bg-gray-200"
              @click="closeMenu">
              <HomeIcon class="h-5 w-5 shrink-0" /><span>{{ t('nav.home') }}</span>
            </RouterLink>
            <RouterLink :to="{ name: 'tests' }"
              class="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 [&.router-link-exact-active]:bg-gray-200"
              @click="closeMenu">
              <RectangleStackIcon class="h-5 w-5 shrink-0" /><span>{{ t('nav.tests') }}</span>
            </RouterLink>
            <RouterLink :to="{ name: 'info' }"
              class="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 [&.router-link-exact-active]:bg-gray-200"
              @click="closeMenu">
              <InformationCircleIcon class="h-5 w-5 shrink-0" /><span>{{ t('nav.info') }}</span>
            </RouterLink>
            <hr class="my-1 border-gray-200" />
            <RouterLink :to="{ name: 'settings' }"
              class="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 [&.router-link-exact-active]:bg-gray-200"
              @click="closeMenu">
              <CogIcon class="h-5 w-5 shrink-0" /><span>{{ t('nav.settings') }}</span>
            </RouterLink>
          </div>
        </Transition>
      </div>

      <!-- Mobile toggle button -->
      <BaseButton variant="icon" class="sm:hidden" @click="toggleMenu" aria-haspopup="true" :aria-expanded="menuOpen"
        title="Menu">
        <span class="sr-only">Open menu</span>
        <XMarkIcon v-if="menuOpen" class="size-7" />
        <Bars3Icon v-else class="size-7" />
      </BaseButton>
    </div>

    <!-- Mobile full-width menu -->
    <Transition enter-active-class="transition duration-150 ease-out" enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
      <div v-if="menuOpen" class="border-t border-gray-200 bg-white shadow-md sm:hidden">
        <ul class="divide-y divide-gray-100">
          <li>
            <RouterLink :to="{ name: 'home' }"
              class="flex w-full items-center gap-3 px-5 py-4 text-base font-medium hover:bg-gray-50 active:bg-gray-100 [&.router-link-exact-active]:bg-gray-200"
              @click="closeMenu">
              <HomeIcon class="h-6 w-6 shrink-0" /><span>{{ t('nav.home') }}</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink :to="{ name: 'tests' }"
              class="flex w-full items-center gap-3 px-5 py-4 text-base font-medium hover:bg-gray-50 active:bg-gray-100 [&.router-link-exact-active]:bg-gray-200"
              @click="closeMenu">
              <RectangleStackIcon class="h-6 w-6 shrink-0" /><span>{{ t('nav.tests') }}</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink :to="{ name: 'info' }"
              class="flex w-full items-center gap-3 px-5 py-4 text-base font-medium hover:bg-gray-50 active:bg-gray-100 [&.router-link-exact-active]:bg-gray-200"
              @click="closeMenu">
              <InformationCircleIcon class="h-6 w-6 shrink-0" /><span>{{ t('nav.info') }}</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink :to="{ name: 'settings' }"
              class="flex w-full items-center gap-3 px-5 py-4 text-base font-medium hover:bg-gray-50 active:bg-gray-100 [&.router-link-exact-active]:bg-gray-200"
              @click="closeMenu">
              <CogIcon class="h-6 w-6 shrink-0" /><span>{{ t('nav.settings') }}</span>
            </RouterLink>
          </li>
        </ul>
      </div>
    </Transition>
  </nav>

  <!-- Backdrop for desktop dropdown -->
  <div v-if="menuOpen" class="fixed inset-0 z-30 hidden sm:block" @click="closeMenu" aria-hidden="true" />
</template>
