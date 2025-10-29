<script setup>
import Navbar from "@/components/Navbar.vue";
import Footer from "@/components/ui/Footer.vue";
import ToastContainer from "@/components/ToastContainer.vue";
</script>

<template>
  <div class="flex min-h-screen w-full flex-col">
    <Navbar />
    <main class="flex flex-1 flex-col gap-4 px-4 pt-4 pb-6 md:items-center">
      <router-view />
    </main>
    <Footer />
    <ToastContainer />
  </div>
</template>
