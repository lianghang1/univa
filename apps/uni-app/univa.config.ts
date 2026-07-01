import { defineConfig } from '@univa/core'

export default defineConfig({
  debug: true,
  pages: {
    globalStyle: {
      navigationBarTitleText: 'Univa2',
    },
  },
  manifest: {
    name: 'univa-app',
    h5: {
      router: {
        mode: 'history',
        base: '/',
      },
    },
  },
})
