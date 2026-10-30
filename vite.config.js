import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// Served from alexmoorephysics.com/escape-room/ (a project repo called "escape-room").
// If you rename the repo, change this to match.
export default defineConfig({
  base: '/escape-room/',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        game: resolve(import.meta.dirname, 'index.html'),
        // Teacher guide: alexmoorephysics.com/escape-room/resources/
        resources: resolve(import.meta.dirname, 'resources/index.html'),
      },
    },
  },
})
