import type { ResolvedOptions, UnivaOptions } from '../types'
import { resolve } from 'node:path'
import { COMPONENTS_ASYNC_DIR_NAME, SUB_PACKAGE_DIR_NAME } from '../constant'
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
 * 默认自动导入源
 * apis: 预设名（vue/uni-app）+ 目录 glob，由 resolveApiSources 自动区分
 */
const DEFAULT_IMPORTS = {
  apis: ['vue', 'uni-app', 'composables/**', 'store/**', 'hooks/**', 'constants/**'],
  components: ['components', 'components-biz'],
}

const DEFAULT_UNI_PRESET = {
  attributify: false,
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

  const srcDirAbs = resolve(root, srcDir)

  const autoScanPackages = scanSubPackages(srcDirAbs, SUB_PACKAGE_DIR_NAME)
  const autoScanCompAsyncPackages = scanSubPackages(srcDirAbs, COMPONENTS_ASYNC_DIR_NAME)

  const userSubPackages = userOptions.dirs?.subPackages ?? []
  const subPackages = [...userSubPackages, ...autoScanPackages, ...autoScanCompAsyncPackages]
  log(`autoScanPackages: ${JSON.stringify({ subPackages })}`)

  const dirs = {
    pages: userOptions.dirs?.pages ?? DEFAULT_DIRS.pages,
    subPackages,
    layouts: userOptions.dirs?.layouts ?? DEFAULT_DIRS.layouts,
  }

  const imports = {
    apis: userOptions.imports?.apis ?? DEFAULT_IMPORTS.apis,
    components: userOptions.imports?.components ?? DEFAULT_IMPORTS.components,
  }

  const unocss = {
    presetLegacyCompat: userOptions.unocss?.presetLegacyCompat ?? true,
    uniPreset: userOptions.unocss?.uniPreset ?? DEFAULT_UNI_PRESET,
    safelist: userOptions.unocss?.safelist ?? [],
    themeColors: userOptions.unocss?.themeColors ?? {},
  }

  return {
    srcDir,
    dirs,
    unocss,
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
