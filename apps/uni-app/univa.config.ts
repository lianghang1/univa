import { defineConfig } from '@univa/core'

export default defineConfig({
  dirs: {
    subPackages: ['pages-sub/demo'],
  },
  // 应用级配置（pages.json 内容，自动生成 .univa/pages.ts）
  pages: {
    globalStyle: {
      navigationBarTitleText: 'Univa',
    },
  },
})
