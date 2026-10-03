import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Relative asset paths so a built copy runs from any folder or sub-path.
  base: './',
  server: { open: true },
})
