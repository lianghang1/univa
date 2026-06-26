import type { Plugin } from 'vite'
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

function createCorePlugin(): Plugin {
  return {
    name: 'vite-plugin-univa',
    enforce: 'pre',
    configureServer(server) {
      context.setupViteServer(server)
    },
  }
}

export function createUnivaPlugins(config: UnivaConfig = { root: false }): Plugin[] {
  const plugins: Plugin[] = []
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
    }) as any)
  }

  plugins.push(...Uni())
  plugins.push(...UnoCSS())

  if (config.autoImport !== false) {
    const autoImportOptions = config.autoImport === true ? {} : config.autoImport || {}
    const autoImportPlugin = AutoImport({
      imports: ['vue'],
      dts: `${univaDir}/auto-imports.d.ts`,
      ...autoImportOptions,
    })
    if (Array.isArray(autoImportPlugin)) {
      plugins.push(...autoImportPlugin)
    }
    else {
      plugins.push(autoImportPlugin)
    }
  }
  return plugins
}

export async function Univa(userConfig: UnivaConfig = {}): Promise<Plugin[]> {
  context = new UnivaContext({
    config: userConfig,
  })

  ensureUnivaDir(context.root)

  await context.loadUserConfig()

  console.log(context.config)

  return createUnivaPlugins(context.config)
}

export default Univa
