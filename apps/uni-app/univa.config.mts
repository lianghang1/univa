import { defineConfig } from '@univa/core'

export default defineConfig({
  root: false,
  pages: {
    globalStyle: {
      navigationBarTitleText: '999',
    },
    subPackages: [
      'src/pages-sub/demo',
      'src/pages-sub/common',
    ],
  },
})
