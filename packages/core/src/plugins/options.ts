import type { ResolvedOptions, UnivaOptions } from '../types'
import { resolve } from 'node:path'
import { mergeWithArrayOverride } from '../utils/merge'

/**
 * 默认目录约定（相对 srcDir）
 */
const DEFAULT_DIRS = {
  pages: 'pages',
  subPackages: ['pages-sub/*'],
  layouts: 'layouts',
}

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
 * 2. 解析 rootDir/srcDir 为绝对路径
 * 3. 保留 overrides 原样（由 createUnivaPlugins 在装配时按模块合并）
 */
export function resolveOptions(userOptions: UnivaOptions, cwd: string): ResolvedOptions {
  const rootDir = userOptions.rootDir || cwd
  const resolvedRootDir = resolve(rootDir)
  const srcDir = userOptions.srcDir || 'src'
  const resolvedSrcDir = resolve(resolvedRootDir, srcDir)

  const dirs = {
    pages: userOptions.dirs?.pages ?? DEFAULT_DIRS.pages,
    subPackages: userOptions.dirs?.subPackages ?? DEFAULT_DIRS.subPackages,
    layouts: userOptions.dirs?.layouts ?? DEFAULT_DIRS.layouts,
  }

  const imports = {
    apis: userOptions.imports?.apis ?? DEFAULT_IMPORTS.apis,
    components: userOptions.imports?.components ?? DEFAULT_IMPORTS.components,
  }

  const resolved: ResolvedOptions = {
    rootDir,
    srcDir,
    resolvedRootDir,
    resolvedSrcDir,
    dirs,
    imports,
    overrides: userOptions.overrides,
  }

  return resolved
}

/**
 * 合并配置（用于配置文件变更时合并默认值与用户配置）
 */
export function mergeOptions(base: UnivaOptions, overrides: UnivaOptions): UnivaOptions {
  return mergeWithArrayOverride(base, overrides) as UnivaOptions
}
