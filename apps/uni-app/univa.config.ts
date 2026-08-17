import { defineConfig } from '@univa/core'

export default defineConfig({
  debug: false,
  pages: {
    globalStyle: {
      navigationBarTitleText: 'Univa2',
    },
    pages: [
      {
        path: 'pages/index',
        type: 'home'
      }
    ]
  },
  imports: {
    apis: [
      {
        from: '@univa/core/use',
        imports: [
          'usePageContext',
        ],
      },
    ],
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
