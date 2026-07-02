import { defineConfig } from '@univa/core'

export default defineConfig({
  debug: true,
  pages: {
    globalStyle: {
      navigationBarTitleText: 'Univa2',
    },
  },
  homePage: {
    path: 'pages/index',
  },
  manifest: {
    'name': 'univa-app',
    'h5': {
      router: {
        mode: 'history',
        base: '/',
      },
    },
    'mp-weixin': {
      optimization: {
        subPackages: true,
      },
    },
  },
})
