/* eslint-disable node/prefer-global/process */
import type { PluginOption } from 'vite'
import type { ResolvedOptions } from '../types'
import Uni from '@uni-helper/plugin-uni'
import UniPolyfill from 'vite-plugin-uni-polyfill'
import { UnivaContext } from '../context'
import { ensureUnivaDir } from '../utils/fs'
import { createAutoImportPlugin } from './auto-import'
import { createComponentsPlugin } from './components'
import { createLayoutsPlugin } from './layouts'
import { createManifestPlugin } from './manifest'
import { createOptimizationPlugin } from './optimization'
import { createPagesPlugin } from './pages'
import { createRootPlugin } from './root'
import { createUnocssPlugin } from './unocss'

/**
 * 创建 Univa 核心插件
 *
 * 持有 context 引用（非全局单例），接入 Vite dev server
 * 以监听 univa.config.ts 变化并分发到各模块 hooks。
 */
function createCorePlugin(context: UnivaContext): PluginOption {
  return {
    name: 'vite-plugin-univa',
    enforce: 'pre',

    configureServer(server) {
      context.setupViteServer(server)
    },
  }
}

/**
 * 创建所有 Univa 插件
 *
 * 每个模块从 resolved options 中提取自己的约定并自行拼装底层插件选项，
 * 合并 overrides（优先级最高）。全部模块默认启用。
 *
 * 需要维护生成文件的模块（pages/manifest）通过 on 注册配置更新 hooks，
 * 由 context 在 univa.config.ts 变化时统一通知，互不影响。
 *
 * 所有路径均为相对 Vite root 的格式，由底层插件自行解析为绝对路径。
 */
export function createUnivaPlugins(resolved: ResolvedOptions, context: UnivaContext): PluginOption[] {
  const on = context.createHookRegistrar()
  const plugins: PluginOption[] = []

  plugins.push(createCorePlugin(context))
  plugins.push(...createPagesPlugin(resolved, on))
  plugins.push(createLayoutsPlugin(resolved))
  plugins.push(createRootPlugin(resolved))
  plugins.push(createComponentsPlugin(resolved))
  plugins.push(createManifestPlugin(resolved, on))

  // uni-app 核心，必需
  plugins.push(...Uni())
  plugins.push(UniPolyfill())
  plugins.push(createUnocssPlugin(resolved))
  plugins.push(createOptimizationPlugin(resolved))
  plugins.push(...createAutoImportPlugin(resolved))

  return plugins
}

/**
 * Univa 插件入口函数（零参数）
 *
 * 工程约定与应用配置通过 `univa.config.ts` 声明，
 * `.univa/pages-config.ts` 等产物由各模块自动生成与维护。
 *
 * @example
 * // vite.config.ts
 * import { Univa } from '@univa/core'
 * export default defineConfig({
 *   plugins: [...Univa()],
 * })
 */
export function Univa(): PluginOption[] {
  const context = new UnivaContext({
    root: process.cwd(),
  })

  ensureUnivaDir(context.root)

  context.loadUserConfig()

  const resolved = context.resolveUserOptions
  if (!resolved) {
    throw new Error('[univa] 配置解析失败，无法创建插件')
  }

  return createUnivaPlugins(resolved, context)
}

export default Univa
