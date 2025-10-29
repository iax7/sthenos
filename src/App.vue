<script setup>
import Navbar from "@/components/Navbar.vue";
import Footer from "@/components/ui/Footer.vue";
import ToastContainer from "@/components/ToastContainer.vue";
</script>

<template>
  <div class="flex w-full flex-col min-h-screen">
    <Navbar />
    <main class="flex-1 flex flex-col md:items-center gap-4 pt-4 pb-6 px-2">
      <router-view />
    </main>
    <Footer  />
    <ToastContainer />
  </div>
</template>
