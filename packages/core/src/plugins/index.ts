/* eslint-disable node/prefer-global/process */
import type { PluginOption } from 'vite'
import type { UnivaConfig } from '../types'
import Uni from '@uni-helper/plugin-uni'
import VitePluginUniComponents from '@uni-helper/vite-plugin-uni-components'
import { VitePluginUniLayouts } from '@uni-helper/vite-plugin-uni-layouts'
import UniKuRoot from '@uni-ku/root'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { ensureUnivaDir, getUnivaDir } from '../utils/fs'
import { UnivaContext } from './context'
import { createPagesPlugin } from './pages'

let context: UnivaContext

function createCorePlugin(): PluginOption {
  return {
    name: 'vite-plugin-univa',
    enforce: 'pre',

    async configResolved() {
      await context.loadUserConfigAsync()
      context.updateGeneratedFiles()
    },

    configureServer(server) {
      context.setupViteServer(server)
    },
  }
}

export function createUnivaPlugins(config: UnivaConfig = { root: false }): PluginOption[] {
  const plugins: PluginOption[] = []
  const univaDir = getUnivaDir(context.root)

  plugins.push(createCorePlugin())

  if (config.pages !== false) {
    plugins.push(...createPagesPlugin(config.pages ?? {}, context.root))
  }

  if (config.layouts !== false) {
    const layoutsOptions = config.layouts === true ? {} : config.layouts || {}
    plugins.push(VitePluginUniLayouts(layoutsOptions))
  }

  if (config.root !== false) {
    const rootOptions = config.root === true ? {} : config.root || {}
    plugins.push(UniKuRoot(rootOptions))
  }

  if (config.components !== false) {
    const componentsOptions = config.components === true ? {} : config.components || {}
    plugins.push(VitePluginUniComponents({
      dts: `${univaDir}/components.d.ts`,
      ...componentsOptions,
    }))
  }

  plugins.push(...Uni())
  plugins.push(...UnoCSS())

  if (config.autoImport !== false) {
    const autoImportOptions = config.autoImport === true ? {} : config.autoImport || {}
    const autoImportPlugin = AutoImport({
      imports: ['vue'],
      dts: `${univaDir}/auto-imports.d.ts`,
      ...autoImportOptions,
    }) as any
    if (Array.isArray(autoImportPlugin)) {
      plugins.push(...autoImportPlugin)
    }
    else {
      plugins.push(autoImportPlugin)
    }
  }
  return plugins
}

/**
 * Univa 插件入口函数
 */
export function Univa(userConfig: UnivaConfig = {}): PluginOption[] {
  context = new UnivaContext({
    root: process.cwd(),
    config: userConfig,
  })

  ensureUnivaDir(context.root)

  context.loadUserConfigSync()

  console.log('[univa] 插件已同步初始化')

  return createUnivaPlugins(context.config) as PluginOption[]
}

export default Univa
