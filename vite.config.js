import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from 'rollup-plugin-visualizer'
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  base: "/sthenos/",
  plugins: [vue(), tailwindcss(), visualizer()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, './src'),
    },
  }
});
