import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Proxy /api to the local FastAPI server so a build with VITE_API_URL="" (see
// .env.tailscale) works same-origin — used for phone testing over tailscale serve.
const apiProxy = { '/api': 'http://localhost:8000' }

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
  server: { proxy: apiProxy },
  preview: { proxy: apiProxy },
})
