<script setup>
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/ui/AppFooter.vue'
import ToastContainer from '@/components/ui/ToastContainer.vue'

const { locale } = useI18n()

// Sync HTML lang attribute with current locale
watch(
  locale,
  (newLocale) => {
    document.documentElement.setAttribute('lang', newLocale)
  },
  { immediate: true }
)
</script>

<template>
  <div class="flex min-h-screen w-full flex-col">
    <AppNavbar />
    <main class="flex flex-1 flex-col gap-4 px-4 pt-4 pb-6 md:items-center">
      <router-view />
    </main>
    <AppFooter />
    <ToastContainer />
  </div>
</template>
