/**
 * Univa 类型定义统一导出
 *
 * 设计哲学：融合约定为主路径，overrides 为底层逃生口
 * - 高层字段（dirs/imports）面向 90% 用户，降低心智成本
 * - overrides 逃生口面向 10% 高级用户，可下沉到底层插件选项
 */

import type { PagesConfig } from '@uni-helper/uni-pages-types'
import type { UserUniPresetOptions } from '@uni-helper/unocss-preset-uni'
// 导入底层插件选项类型（当前文件引用 + 重导出）
import type { Options as ComponentsOptions } from '@uni-helper/vite-plugin-uni-components'
import type { UserManifestConfig } from '@uni-helper/vite-plugin-uni-manifest'
import type { PageContext, UserOptions as PagesPluginOptions } from '@uni-helper/vite-plugin-uni-pages'
import type { IOptions as OptimizerOptions } from '@uni-ku/bundle-optimizer'
import type { ConfigBase as UnoCSSConfigBase } from 'unocss'
import type { Options as AutoImportOptions } from 'unplugin-auto-import/types'
import type { UserManifestOptions } from '../plugins/manifest'

// 重导出 pages.json 内容相关类型
export type {
  Condition,
  EasyCom,
  GlobalStyle,
  PageMetaDatum,
  PagesConfig,
  SubPackage,
  TabBar,
  TabBarItem,
} from '@uni-helper/uni-pages-types'

// 重导出底层插件选项类型（用于 overrides 逃生口）
export type { AutoImportOptions, ComponentsOptions, PageContext, PagesPluginOptions, UnoCSSConfigBase, UserUniPresetOptions }

// 重导出工具类型
export type {
  ComponentInfo,
  ComponentResolver,
  ResolvedOptions as ComponentsResolvedOptions,
  ImportInfo,
} from '@uni-helper/vite-plugin-uni-components'

export type {
  definePage,
  PagePath,
  ResolvedOptions as PagesResolvedOptions,
  SubPageMetaDatum,
} from '@uni-helper/vite-plugin-uni-pages'

/**
 * 目录约定（相对 srcDir）
 */
export interface UnivaDirs {
  /** 主包页面目录，默认 'pages' */
  pages?: string
  /** 分包页面根目录列表，默认扫描 'pages-sub/' 下第一层目录 */
  subPackages?: string[]
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
   * 组件自动导入源
   *
   * glob 模式，相对 srcDir。默认 ['components/**', 'components-biz/**']
   */
  components?: string[]
}

/**
 * 解析后的目录约定（字段必填，已应用默认值）
 */
export interface ResolvedUnivaDirs {
  pages: string
  subPackages: string[]
  layouts: string
}

export interface ResolvedUnivaUnocss {
  presetLegacyCompat: boolean
  uniPreset: UserUniPresetOptions
  safelist: string[]
  themeColors: Record<string, string>
}

/**
 * 解析后的自动导入配置（字段必填，已应用默认值）
 */
export interface ResolvedUnivaImports {
  apis: Array<string | Record<string, unknown>>
  components: string[]
}

/**
 * Layouts 模块底层选项（用于 overrides）
 */
export interface LayoutsOptions {
  layout?: string
  layoutDir?: string
  cwd?: string
}

/**
 * Root 模块底层选项（用于 overrides）
 */
export interface RootOptions {
  enabledVirtualHost?: boolean
  enabledGlobalRef?: boolean
  rootFileName?: string
  excludePages?: string | string[]
}

/**
 * UnoCSS 模块底层选项（用于 overrides）
 */
export interface UnoCSSOptions extends UnoCSSConfigBase {}

/**
 * 底层插件逃生口
 *
 * 高级用户可通过此字段直接覆盖底层插件选项，优先级最高。
 * 90% 场景下不需要使用此字段，请优先使用上层融合约定。
 */
export interface UnivaOverrides {
  /** @uni-helper/vite-plugin-uni-pages 完整选项 */
  pages?: PagesPluginOptions
  /** @uni-helper/vite-plugin-uni-layouts 完整选项 */
  layouts?: LayoutsOptions
  /** @uni-helper/vite-plugin-uni-components 完整选项 */
  components?: ComponentsOptions
  /** @uni-ku/root 完整选项 */
  root?: RootOptions
  /** unplugin-auto-import 完整选项 */
  autoImport?: AutoImportOptions
  /** unocss/vite 完整选项 */
  unocss?: UnoCSSOptions
  /** @uni-helper/vite-plugin-uni-manifest 完整选项 */
  manifest?: UserManifestOptions
  /** @uni-ku/bundle-optimizer 完整选项 */
  optimization?: OptimizerOptions
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
 * 与 UnivaOptions 的差异：srcDir/dirs/imports 为必填（已应用默认值）。
 * 所有路径保持相对 Vite root 的格式，由底层插件自行解析。
 */
export interface ResolvedOptions extends Omit<UnivaOptions, 'dirs' | 'imports' | 'srcDir'> {
  /** 源码目录（已应用默认值，相对 Vite root） */
  srcDir: string
  /** 目录约定（已应用默认值，字段必填） */
  dirs: ResolvedUnivaDirs
  /** 自动导入配置（已应用默认值，字段必填） */
  imports: ResolvedUnivaImports
  unocss: ResolvedUnivaUnocss
}
