import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  vite: {
    plugins: [
      tanstackRouter(),
      react(),
      tailwindcss(),
      tsconfigPaths(),
    ],
    build: {
      outDir: "dist/client",
    },
  },
});
