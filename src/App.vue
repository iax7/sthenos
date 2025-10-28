<script setup>
import Navbar from "./components/Navbar.vue";
import ToastContainer from "./components/ToastContainer.vue";
</script>

<template>
  <div class="flex w-full flex-col">
    <Navbar />
    <main class="flex-1 flex w-full flex-col items-stretch md:items-center gap-8 pt-8 pb-12 px-4">
      <router-view />
    </main>
    <ToastContainer />
  </div>
</template>
