import type { ComponentResolver } from '@uni-helper/vite-plugin-uni-components'
import type { ResolvedOptions, UnivaOptions } from '../types'
import { resolve } from 'node:path'
import { COMPONENTS_ASYNC_DIR_NAME, SUB_PACKAGE_DIR_NAME } from '../constant'
import { scanSubPackages } from '../utils/fs'
import { log } from '../utils/logger'

/**
 * 融合层默认约定
 *
 * 用户配置与默认值合并（用户优先），全部在此处完成，下游插件零默认值逻辑。
 */
const DEFAULTS = {
  srcDir: 'src',
  pagesDir: 'pages',
  layoutsDir: 'layouts',
  /** API 自动导入：预设名（vue/uni-app）+ 目录 glob */
  apis: ['vue', 'uni-app', 'composables/**', 'store/**', 'hooks/**', 'constants/**'],
  /** 组件自动导入目录 */
  components: ['components', 'components-biz'],
  uniPreset: { attributify: false },
}

/* -------------------------------------------------------------------------- */
/* 自动导入源拆分                                                              */
/* -------------------------------------------------------------------------- */

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
 * 目录统一拼接 srcDir 前缀（相对 Vite root），支持 `!` 前缀排除。
 */
function resolveApiSources(
  sources: Array<string | Record<string, unknown>>,
  srcDir: string,
): { presets: Array<string | Record<string, unknown>>, dirs: string[] } {
  const presets: Array<string | Record<string, unknown>> = []
  const dirs: string[] = []

  for (const source of sources) {
    if (typeof source !== 'string') {
      presets.push(source)
    }
    else if (source.startsWith('!')) {
      dirs.push(`!${srcDir}/${source.slice(1)}`)
    }
    else if (isPresetName(source)) {
      presets.push(source)
    }
    else {
      dirs.push(`${srcDir}/${source}`)
    }
  }

  return { presets, dirs }
}

/**
 * 将 imports.components 拆分为目录扫描（dirs）与组件解析器（resolvers）
 *
 * 字符串 → 目录 glob（支持 `!` 前缀排除）；
 * resolver（对象/函数/数组）→ 第三方组件库按需解析，自动扁平化。
 */
function resolveComponentSources(
  sources: Array<string | ComponentResolver | ComponentResolver[]>,
  srcDir: string,
): { dirs: string[], resolvers: ComponentResolver[] } {
  const dirs: string[] = []
  const resolvers: ComponentResolver[] = []

  for (const source of sources) {
    if (typeof source !== 'string') {
      resolvers.push(...(Array.isArray(source) ? source : [source]))
    }
    else if (source.startsWith('!')) {
      dirs.push(`!${srcDir}/${source.slice(1)}`)
    }
    else {
      dirs.push(`${srcDir}/${source}`)
    }
  }

  return { dirs, resolvers }
}

/* -------------------------------------------------------------------------- */
/* 解析主入口                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * 解析用户配置为"全熟"配置
 *
 * 这是唯一的 resolve 入口，产出物所有字段均为确定值：
 * - 可选字段已应用默认值（下游不再 `??` 防御）
 * - 目录路径已归一化为相对 root 的最终形态（下游不再拼接 srcDir 前缀）
 * - 自动导入源已完成预设/目录/resolver 拆分
 *
 * 职责：
 * 1. 合并默认约定（用户优先）
 * 2. 自动扫描分包目录（pages-sub/、components-async/）
 * 3. 拆分自动导入源、归一化路径
 */
export function resolveOptions(userOptions: UnivaOptions, root: string): ResolvedOptions {
  const srcDir = userOptions.srcDir ?? DEFAULTS.srcDir
  const srcDirAbs = resolve(root, srcDir)
  const toRootPath = (dir: string) => `${srcDir}/${dir}`

  // 目录约定：默认值 + 用户配置 + 自动扫描，统一归一化为相对 root 的路径
  const subPackageDir = userOptions.dirs?.subPackageDir ?? SUB_PACKAGE_DIR_NAME
  const componentsAsyncDir = userOptions.dirs?.componentsAsyncDir ?? COMPONENTS_ASYNC_DIR_NAME
  const subPackageNames = [
    ...(userOptions.dirs?.subPackages ?? []),
    ...scanSubPackages(srcDirAbs, subPackageDir),
    ...scanSubPackages(srcDirAbs, componentsAsyncDir),
  ]
  const dirs = {
    pages: toRootPath(userOptions.dirs?.pages ?? DEFAULTS.pagesDir),
    layouts: toRootPath(userOptions.dirs?.layouts ?? DEFAULTS.layoutsDir),
    subPackages: subPackageNames.map(toRootPath),
    subPackageDir,
    componentsAsyncDir,
  }
  log(`分包目录：${JSON.stringify(dirs.subPackages)}`)

  // 自动导入：用户源 + 默认源 → 拆分（预设/目录、目录/resolver）
  const apiSources = [...(userOptions.imports?.apis ?? []), ...DEFAULTS.apis]
  const { presets: apiPresets, dirs: apiDirs } = resolveApiSources(apiSources, srcDir)

  const componentSources = [...(userOptions.imports?.components ?? []), ...DEFAULTS.components]
  const { dirs: componentDirs, resolvers: componentResolvers } = resolveComponentSources(componentSources, srcDir)

  // UnoCSS 配置
  const unocss = {
    presetLegacyCompat: userOptions.unocss?.presetLegacyCompat ?? true,
    uniPreset: { ...DEFAULTS.uniPreset, ...userOptions.unocss?.uniPreset },
    safelist: userOptions.unocss?.safelist ?? [],
    themeColors: userOptions.unocss?.themeColors ?? {},
  }

  return {
    root,
    debug: userOptions.debug ?? false,
    srcDir,
    srcDirAbs,
    dirs,
    imports: { apiPresets, apiDirs, componentDirs, componentResolvers },
    unocss,
    pages: userOptions.pages ?? {},
    manifest: userOptions.manifest,
    overrides: userOptions.overrides ?? {},
  }
}
