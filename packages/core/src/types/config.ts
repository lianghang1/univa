import type { PageMetaDatum, PagesConfig } from '@uni-helper/uni-pages-types'
import type { UserUniPresetOptions } from '@uni-helper/unocss-preset-uni'
import type { ComponentResolver } from '@uni-helper/vite-plugin-uni-components'
import type { UserManifestConfig } from '@uni-helper/vite-plugin-uni-manifest'
import type { UnivaOverrides } from './overrides'

/**
 * 目录约定（相对 srcDir）
 */
export interface UnivaDirs {
  /** 主包页面目录，默认 'pages' */
  pages?: string
  /** 手动分包列表（相对 srcDir），与自动扫描结果合并 */
  subPackages?: string[]
  /** 分包裹目录名（其下每个一级子目录注册为一个分包），默认 'app' */
  subPackageDir?: string
  /** 异步组件分包裹目录名（其下分包页面自动关闭 layout），默认 'components-async' */
  componentsAsyncDir?: string
  /** 布局目录，默认 'layouts' */
  layouts?: string
}

export interface UnivaUnocss {
  /** 是否开启兼容模式，默认 false */
  presetLegacyCompat?: boolean
  uniPreset?: UserUniPresetOptions
  safelist?: string[]
  themeColors?: Record<string, string>
}

/**
 * 自动导入配置
 */
export interface UnivaImports {
  /**
   * 自动导入源，统一配置预设导入与目录扫描
   *
   * 支持三种形式：
   * - 预设名（字符串）：`'vue'`、`'uni-app'`、`'pinia'`、`'@vueuse/core'`
   * - 目录 glob（字符串）：`'composables/**'`、`'stores/**'`（相对 srcDir）
   *   - 支持 negation 前缀 `!` 排除特定路径
   * - inline preset（对象）：`{ from: 'wot-design-uni', imports: ['useToast'] }`
   *   - 或命名导入映射：`{ '@fun-design/use': ['useState', 'useVModel'] }`
   *
   * 内部自动区分：含 glob 字符或路径分隔符的字符串 → 目录扫描，否则 → 预设导入。
   * 对象形式统一作为 inline preset 传给 unplugin-auto-import。
   */
  apis?: Array<string | Record<string, unknown>>
  /**
   * 组件自动导入源，统一配置目录扫描与第三方解析器
   *
   * 支持两种形式：
   * - 目录 glob（字符串）：`'components'`、`'components-biz/**'`（相对 srcDir）
   *   - 支持 negation 前缀 `!` 排除特定路径
   * - 组件解析器（resolver）：按需导入第三方组件库，如 `WotResolver()`
   *   - resolver 函数返回单个或数组均可，无需手动展开
   *
   * 内部自动区分：字符串 → 目录扫描，其他 → resolvers。
   */
  components?: Array<string | ComponentResolver | ComponentResolver[]>
}

/**
 * 解析后的目录约定（字段必填，路径已归一化为相对 root 的最终形态）
 */
export interface ResolvedUnivaDirs {
  /** 主包页面目录（相对 root，如 'src/pages'） */
  pages: string
  /** 布局目录（相对 root） */
  layouts: string
  /** 分包目录列表（相对 root，已合并用户配置与自动扫描） */
  subPackages: string[]
  /** 分包裹目录名（相对 srcDir，已应用默认值） */
  subPackageDir: string
  /** 异步组件分包裹目录名（相对 srcDir，已应用默认值） */
  componentsAsyncDir: string
}

export interface ResolvedUnivaUnocss {
  presetLegacyCompat: boolean
  uniPreset: UserUniPresetOptions
  safelist: string[]
  themeColors: Record<string, string>
}

/**
 * 解析后的自动导入配置（字段必填，源已完成拆分、路径已拼接）
 */
export interface ResolvedUnivaImports {
  /** 预设导入与 inline preset（unplugin-auto-import 的 imports） */
  apiPresets: Array<string | Record<string, unknown>>
  /** API 目录扫描（已含 srcDir 前缀与默认值，unplugin-auto-import 的 dirs） */
  apiDirs: string[]
  /** 组件目录扫描（已含 srcDir 前缀与默认值） */
  componentDirs: string[]
  /** 组件解析器（已扁平化） */
  componentResolvers: ComponentResolver[]
}

/**
 * Univa 统一配置接口（工程级约定）
 *
 * 用于 univa.config.ts，声明项目工程结构、自动导入约定与应用级配置。
 */
export interface UnivaOptions {
  /** 源码目录，相对 Vite root，默认 'src' */
  srcDir?: string

  /** 开启调试日志，默认 false */
  debug?: boolean

  /** 目录约定，相对 srcDir */
  dirs?: UnivaDirs

  /** 自动导入配置 */
  imports?: UnivaImports

  /**
   * 应用级 pages.json 配置（globalStyle / tabBar 等）
   *
   * Univa 会读取此字段自动生成 .univa/pages.ts，
   * 供 VitePluginUniPages 消费。
   *
   * 注意：pages / subPackages 由目录扫描自动填充，请勿在此手写。
   */
  pages?: Partial<PagesConfig>

  /** 应用级 manifest.json 配置 */
  manifest?: Partial<UserManifestConfig>

  unocss?: UnivaUnocss

  /** 底层插件逃生口（覆盖融合层默认，高级用户使用） */
  overrides?: UnivaOverrides
}

/**
 * 解析后的完整配置（内部使用）
 *
 * resolveOptions 的产出物，所有字段均为确定值：
 * - 可选字段已应用默认值，下游无需 `??` 防御
 * - 目录路径已归一化为相对 root 的最终形态，下游无需拼接
 *
 * 与 UnivaOptions 的关系：不再继承/展开用户配置，显式声明全部字段。
 */
export interface ResolvedOptions {
  /** 项目根目录（Vite root，绝对路径） */
  root: string
  /** 是否开启调试日志 */
  debug: boolean
  /** 源码目录（相对 root） */
  srcDir: string
  /** 源码目录绝对路径 */
  srcDirAbs: string
  /** 目录约定（已应用默认值、自动扫描、路径归一化） */
  dirs: ResolvedUnivaDirs
  /** 自动导入配置（已应用默认值、源拆分、路径拼接） */
  imports: ResolvedUnivaImports
  /** UnoCSS 配置（已应用默认值） */
  unocss: ResolvedUnivaUnocss
  /** 应用级 pages.json 配置（默认 {}） */
  pages: Partial<PagesConfig>
  /** 应用级 manifest 配置 */
  manifest?: Partial<UserManifestConfig>
  /** 底层插件逃生口（默认 {}） */
  overrides: UnivaOverrides
}
