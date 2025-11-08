<script setup>
import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/ui/AppFooter.vue'
import ToastContainer from '@/components/ui/ToastContainer.vue'
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
