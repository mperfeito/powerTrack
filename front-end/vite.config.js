import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')  // <-- este alias que o @ representa a pasta src
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    // Aqui podes adicionar o alias também para testes (Vitest lê do vite config)
  }
})
