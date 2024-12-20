import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  //change port for production
  preview: {
    port: 3000,
  },
// for dev
  server: {
    port: 3000,
  },
})