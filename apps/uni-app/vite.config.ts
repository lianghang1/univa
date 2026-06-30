import { fileURLToPath, URL } from 'node:url'
// import Uni from '@uni-helper/plugin-uni'
import { Univa } from '@univa/core'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    // Uni(),
    ...Univa(),
  ],
})
