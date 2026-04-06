import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  envPrefix: ["AISA_", "VITE_"],
  server: {
<<<<<<< HEAD
    host: true,
    allowedHosts: true, // required for Vite 6+ to work with ngrok
=======
    host: true, // Listen on all network interfaces
    allowedHosts: true, // Allow ngrok URLs to bypass host checks in Vite 6
>>>>>>> 7d475261ccffc488e589154ff1a7a34984f3afb4
  },
  build: {
    outDir: "dist",
    reportCompressedSize: false,
    minify: false
  }
})
