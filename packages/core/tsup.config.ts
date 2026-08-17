import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/use.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  silent: false,
})
