import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  
server: {
    proxy: {
      "/api": {
<<<<<<< HEAD
        target: "http://localhost:5000",
=======
        target: "https://slack-2.onrender.com", 
>>>>>>> feabe0d469cb834fabf3745faf763b07149e1df7
        changeOrigin: true,
        secure: false, 
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
