import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import vue from "@vitejs/plugin-vue";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [react(), vue(), svelte()],
  build: {
    outDir: "dist/assets/components",
    emptyOutDir: true,
    rollupOptions: {
      input: "src/client/islands.ts",
      output: {
        entryFileNames: "islands.js",
        chunkFileNames: "chunks/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]"
      }
    }
  }
});
