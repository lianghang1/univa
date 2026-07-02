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
 * 默认自动导入配置
 *
 * apis: 预设名（vue/uni-app）+ 目录 glob
 * components: 组件目录
 */
const DEFAULT_IMPORTS = {
  apis: ['vue', 'uni-app', 'composables/**', 'store/**', 'hooks/**', 'constants/**'],
  components: ['components', 'components-biz'],
}

/**
 * 默认 UnoCSS uni preset 配置
 */
const DEFAULT_UNI_PRESET = {
  attributify: false,
}

/**
 * 解析用户配置为完整配置
 *
 * 职责：
 * - 应用默认值（dirs/imports/unocss）
 * - 自动扫描分包目录（pages-sub/、components-async/）
 * - 合并用户配置与默认值（用户优先）
 */
export function resolveOptions(userOptions: UnivaOptions, root: string): ResolvedOptions {
  const srcDir = userOptions.srcDir || 'src'
  const srcDirAbs = resolve(root, srcDir)

  // 自动扫描分包目录
  const autoScanPackages = scanSubPackages(srcDirAbs, SUB_PACKAGE_DIR_NAME)
  const autoScanCompAsyncPackages = scanSubPackages(srcDirAbs, COMPONENTS_ASYNC_DIR_NAME)

  // 合包目录：用户配置 + 自动扫描
  const userSubPackages = userOptions.dirs?.subPackages ?? []
  const subPackages = [...userSubPackages, ...autoScanPackages, ...autoScanCompAsyncPackages]
  log(`自动扫描分包目录：${JSON.stringify({ subPackages })}`)

  // 目录约定（应用默认值）
  const dirs = {
    pages: userOptions.dirs?.pages ?? DEFAULT_DIRS.pages,
    subPackages,
    layouts: userOptions.dirs?.layouts ?? DEFAULT_DIRS.layouts,
  }

  // 自动导入配置（用户配置追加默认值）
  const imports = {
    apis: [...(userOptions.imports?.apis ?? []), ...DEFAULT_IMPORTS.apis],
    components: [...(userOptions.imports?.components ?? []), ...DEFAULT_IMPORTS.components],
  }

  // UnoCSS 配置（合并用户配置）
  const unocss = {
    presetLegacyCompat: userOptions.unocss?.presetLegacyCompat ?? true,
    uniPreset: { ...DEFAULT_UNI_PRESET, ...userOptions.unocss?.uniPreset },
    safelist: userOptions.unocss?.safelist ?? [],
    themeColors: userOptions.unocss?.themeColors ?? {},
  }

  return {
    // 先展开用户配置（所有属性）
    ...userOptions,
    // 解析后的属性覆盖原始属性（必填、已应用默认值）
    srcDir,
    srcDirAbs,
    dirs,
    imports,
    unocss,
  }
}

/**
 * 合并配置
 *
 * 用于配置文件变更时合并默认值与用户配置
 */
export function mergeOptions(base: UnivaOptions, overrides: UnivaOptions): UnivaOptions {
  return mergeWithArrayOverride(base, overrides) as UnivaOptions
}
