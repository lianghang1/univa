import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/use.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  silent: false,
  external: [
    'fs',
    'fs/promises',
    'path',
    'vue',
    'vite',
    'c12',
    'jiti',
    'defu',
    '@antfu/utils',
    'unocss',
    'unocss/vite',
    '@uni-helper/*',
    '@uni-ku/*',
    'unplugin-auto-import',
    'unplugin-auto-import/vite',
  ],
})
