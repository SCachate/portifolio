import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: true, // Isso permite que o Codespaces abra o link externo
    port: 5173
  }
})