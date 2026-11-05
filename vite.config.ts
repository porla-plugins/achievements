import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  root: "src",
  base: "./",
  plugins: [tailwindcss(), react()],
  build: {
    outDir: "../ui",
    emptyOutDir: true,
    rollupOptions: {
      input: { index: "src/init.html", share: "src/stats.html" },
    },
  },
});
