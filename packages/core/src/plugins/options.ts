import type { ResolvedOptions, UnivaOptions } from '../types'
import { resolve } from 'node:path'
import { scanSubPackages } from '../utils/fs'
import { log } from '../utils/logger'
import { mergeWithArrayOverride } from '../utils/merge'

/**
 * 默认目录约定（相对 srcDir）
 */
const DEFAULT_DIRS = {
  pages: 'pages',
  subPackages: [] as string[],
  layouts: 'layouts',
}

/**
 * 默认分包根目录名称
 */
const DEFAULT_SUB_PACKAGE_ROOT = 'app'

/**
 * 默认自动导入源
 * apis: 预设名（vue/uni-app）+ 目录 glob，由 resolveApiSources 自动区分
 */
const DEFAULT_IMPORTS = {
  apis: ['vue', 'uni-app', 'composables/**', 'stores/**', 'hooks/**', 'constants/**'],
  components: ['components/**', 'components-biz/**'],
}

/**
 * 解析用户配置为完整配置
 *
 * 职责：
 * 1. 应用默认值（dirs/imports 等约定）
 * 2. 保留 srcDir 相对路径（相对 Vite root），由底层插件自行解析
 * 3. 保留 overrides 原样（由 createUnivaPlugins 在装配时按模块合并）
 */
export function resolveOptions(userOptions: UnivaOptions, root: string): ResolvedOptions {
  const srcDir = userOptions.srcDir || 'src'

  // 分包目录处理逻辑：
  // 1. 自动扫描 pages-sub/ 下第一层目录
  // 2. 追加到用户配置的 subPackages 数组中
  const srcDirAbs = resolve(root, srcDir)
  const autoScanPackages = scanSubPackages(srcDirAbs, DEFAULT_SUB_PACKAGE_ROOT)
  const userSubPackages = userOptions.dirs?.subPackages ?? []
  const subPackages = [...userSubPackages, ...autoScanPackages]
  log(`autoScanPackages: ${JSON.stringify({ srcDirAbs, autoScanPackages })}`)

  const dirs = {
    pages: userOptions.dirs?.pages ?? DEFAULT_DIRS.pages,
    subPackages,
    layouts: userOptions.dirs?.layouts ?? DEFAULT_DIRS.layouts,
  }

  const imports = {
    apis: userOptions.imports?.apis ?? DEFAULT_IMPORTS.apis,
    components: userOptions.imports?.components ?? DEFAULT_IMPORTS.components,
  }

  return {
    srcDir,
    dirs,
    imports,
    overrides: userOptions.overrides,
  }
}

/**
 * 合并配置（用于配置文件变更时合并默认值与用户配置）
 */
export function mergeOptions(base: UnivaOptions, overrides: UnivaOptions): UnivaOptions {
  return mergeWithArrayOverride(base, overrides) as UnivaOptions
}
