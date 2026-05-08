import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist/client",
    rollupOptions: {
      input: {
        main: "index.html",
      },
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          ethers: ["ethers"],
          supabase: ["@supabase/supabase-js"],
          privy: ["@privy-io/react-auth"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
