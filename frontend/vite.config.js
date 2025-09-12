import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // vite.config.js
server: {
    proxy: {
      "/api": {
        target: "https://slack-6u84.onrender.com", // 👈 make sure this is http
        changeOrigin: true,
        secure: false, // disable SSL check
      },
    },
  },


  define: {
    global: "window",
  },
  resolve: {
    alias: {
      util: "util",
    },
  },
});
