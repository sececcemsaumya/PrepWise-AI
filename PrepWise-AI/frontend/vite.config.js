import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://prepwise-ai-backend-up1w.onrender.com",
        changeOrigin: true,
      },
      "/socket.io": {
        target: "https://prepwise-ai-backend-up1w.onrender.com",
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
