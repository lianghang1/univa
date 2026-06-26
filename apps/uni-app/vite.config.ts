import { fileURLToPath, URL } from 'node:url'
// import Uni from '@uni-helper/plugin-uni'
import { Univa } from '@univa/core'
import { defineConfig } from 'vite'

export default defineConfig(async ({ mode }) => {
  console.log(mode)
  return defineConfig({
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    plugins: [
      Univa({
        root: false,
        pages: {
          globalStyle: {
            navigationBarTitleText: 'Univa-app',
          },
        },
      }),
      // Uni(),
    ],
  })
})
