import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  silent: false,
  external: [
    'fs',
    'fs/promises',
    'path',
    'vite',
    'c12',
    'unocss',
    'unocss/vite',
    '@uni-helper/*',
    '@uni-ku/*',
    'unplugin-auto-import',
    'unplugin-auto-import/vite',
  ],
})
