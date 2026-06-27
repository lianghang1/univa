/* eslint-disable node/prefer-global/process */
import type { PluginOption } from 'vite'
import type { ResolvedOptions } from '../types'
import { resolve } from 'node:path'
import { slash } from '@antfu/utils'
import Uni from '@uni-helper/plugin-uni'
import VitePluginUniComponents from '@uni-helper/vite-plugin-uni-components'
import { VitePluginUniLayouts } from '@uni-helper/vite-plugin-uni-layouts'
import UniKuRoot from '@uni-ku/root'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { ensureUnivaDir, getUnivaDir } from '../utils/fs'
import { UnivaContext } from './context'
import { resolveOptions } from './options'
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

/**
 * 判断字符串是否为预设导入名（而非目录/glob）
 *
 * 含 glob 字符或路径分隔符 → 目录；scope 包名或纯名字 → 预设
 */
function isPresetName(from: string): boolean {
  if (/[*?[\]{}]/.test(from))
    return false
  if (/^@[\w.-]+\/[\w.-]+$/.test(from))
    return true
  if (/[/\\]/.test(from))
    return false
  return true
}

/**
 * 将 imports.apis 拆分为预设导入（presets）与目录扫描（dirs）
 *
 * 字符串自动识别为预设名或目录 glob；对象形式作为 inline preset。
 * fast-glob 需要正斜杠路径，故 dirs 统一转为 posix 风格。
 */
function resolveApiSources(sources: Array<string | Record<string, unknown>>, srcDir: string): { presets: Array<string | Record<string, unknown>>, dirs: string[] } {
  const presets: Array<string | Record<string, unknown>> = []
  const dirs: string[] = []
  for (const source of sources) {
    if (typeof source !== 'string') {
      presets.push(source)
    }
    else if (source.startsWith('!')) {
      dirs.push(`!${slash(resolve(srcDir, source.slice(1)))}`)
    }
    else if (isPresetName(source)) {
      presets.push(source)
    }
    else {
      dirs.push(slash(resolve(srcDir, source)))
    }
  }
  return { presets, dirs }
}

/**
 * 创建所有 Univa 插件
 *
 * 从 resolved options 提取高层约定（dirs/imports），转换为底层插件选项，
 * 合并 overrides（优先级最高）。全部模块默认启用。
 */
export function createUnivaPlugins(resolved: ResolvedOptions): PluginOption[] {
  const plugins: PluginOption[] = []
  const univaDir = getUnivaDir(resolved.resolvedRootDir)
  const srcDir = resolved.resolvedSrcDir

  plugins.push(createCorePlugin())

  const pagesDir = resolve(srcDir, resolved.dirs.pages)
  const subPackages = resolved.dirs.subPackages.map(p => resolve(srcDir, p))
  plugins.push(...createPagesPlugin({
    dir: pagesDir,
    subPackages,
    ...resolved.overrides?.pages,
  }, resolved.resolvedRootDir))

  plugins.push(VitePluginUniLayouts({
    layoutDir: resolve(srcDir, resolved.dirs.layouts),
    cwd: srcDir,
    ...resolved.overrides?.layouts,
  }))

  plugins.push(UniKuRoot({
    enabledGlobalRef: true,
    excludePages: [
      'components-async/**/*.*',
    ],
    ...resolved.overrides?.root,
  }))

  const componentDirs = resolved.imports.components.map(c => slash(resolve(srcDir, c)))
  plugins.push(VitePluginUniComponents({
    dirs: componentDirs,
    dts: `${univaDir}/components.d.ts`,
    globalNamespaces: ['components', 'common'],
    directoryAsNamespace: true,
    ...resolved.overrides?.components,
  }))

  // uni-app 核心，必需
  plugins.push(...Uni())
  plugins.push(...UnoCSS())

  const { presets, dirs } = resolveApiSources(resolved.imports.apis, srcDir)
  const autoImportPlugin = AutoImport({
    imports: presets as any,
    dirs,
    dts: `${univaDir}/auto-imports.d.ts`,
    ...resolved.overrides?.autoImport,
  }) as any
  if (Array.isArray(autoImportPlugin)) {
    plugins.push(...autoImportPlugin)
  }
  else {
    plugins.push(autoImportPlugin)
  }

  return plugins
}

/**
 * Univa 插件入口函数（零参数）
 *
 * 工程约定与应用配置通过 `univa.config.ts` 声明，
 * `.univa/pages.ts` 等产物自动生成。
 *
 * @example
 * // vite.config.ts
 * import { Univa } from '@univa/core'
 * export default defineConfig({
 *   plugins: [...Univa()],
 * })
 */
export function Univa(): PluginOption[] {
  context = new UnivaContext({
    root: process.cwd(),
  })

  ensureUnivaDir(context.root)

  context.loadUserConfigSync()

  const resolved = resolveOptions(context.config || {}, context.root)

  console.log('[univa] 已加载配置：', context.configPath || '默认配置')

  return createUnivaPlugins(resolved) as PluginOption[]
}

export default Univa
