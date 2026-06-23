import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// اسم المستودع على GitHub — غيّره إلى اسم الـ repo الخاص بك
// مثال: إذا كان الرابط github.com/ahmed/neon-runner ← اكتب "/neon-runner/"
const REPO_NAME = "/ge_game/";

export default defineConfig({
  base: REPO_NAME,
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three"],
          fiber: ["@react-three/fiber", "@react-three/drei"],
          react: ["react", "react-dom"],
        },
      },
    },
  },
});
