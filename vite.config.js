// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/",
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://api.gasdg.store",
        changeOrigin: true,
        secure: false, // 🔹 HTTPS 사용해야 함
      },
    },
  },
});
