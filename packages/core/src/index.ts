/**
 * @univa/core - Univa 统一入口
 */

export { defineConfig } from './config'
export { createUnivaPlugins, default as Univa } from './plugins'
export type * from './types'

export { presetUni } from '@uni-helper/unocss-preset-uni'
export { camelCase, kebabCase, pascalCase } from '@uni-helper/vite-plugin-uni-components'
export { default as VitePluginUniComponents } from '@uni-helper/vite-plugin-uni-components'
export { VitePluginUniLayouts } from '@uni-helper/vite-plugin-uni-layouts'
export { VitePluginUniPages } from '@uni-helper/vite-plugin-uni-pages'
export { default as UniKuRoot } from '@uni-ku/root'
export { default as AutoImport } from 'unplugin-auto-import/vite'
