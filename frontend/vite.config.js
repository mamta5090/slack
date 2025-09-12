import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // vite.config.js
server: {
  proxy: {
    "/api": {
      target: "https://slack-1.onrender.com",
      changeOrigin: true,
      secure: false
    }
  }
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
