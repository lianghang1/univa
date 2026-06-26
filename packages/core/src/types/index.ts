/**
 * Univa 类型定义统一导出
 */

// 重导出 pages.json 相关类型
// 导入用于定义 PagesOptions 的类型
import type { PagesConfig } from '@uni-helper/uni-pages-types'
// 导入用于 UnivaConfig 的类型
import type { Options as ComponentsOptions } from '@uni-helper/vite-plugin-uni-components'

import type { UserOptions as PagesPluginOptions } from '@uni-helper/vite-plugin-uni-pages'
import type { Options as AutoImportOptions } from 'unplugin-auto-import/types'

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

/**
 * Pages 模块完整配置
 */
export interface PagesOptions extends Omit<PagesPluginOptions, 'subPackages'>, PagesConfig {
  options?: PagesPluginOptions
  content?: PagesConfig
}

/**
 * Layouts 模块配置选项
 */
export interface LayoutsOptions {
  layout?: string
  layoutDir?: string
  cwd?: string
}

/**
 * Root 模块配置选项
 */
export interface RootOptions {
  enabledVirtualHost?: boolean
  enabledGlobalRef?: boolean
  rootFileName?: string
  excludePages?: string | string[]
}

/**
 * UnoCSS 模块配置选项
 */
export interface UnoCSSOptions {
  presets?: unknown[]
  rules?: unknown[]
  shortcuts?: Record<string, string | string[]>
}

/**
 * Univa 统一配置接口
 */
export interface UnivaConfig {
  pages?: PagesOptions | PagesPluginOptions | boolean
  layouts?: LayoutsOptions | boolean
  components?: ComponentsOptions | boolean
  root?: RootOptions | boolean
  autoImport?: AutoImportOptions | boolean
  unocss?: UnoCSSOptions | boolean
  manifest?: unknown
  platform?: unknown
}

// 重导出其他模块类型
export type {
  ComponentInfo,
  ComponentResolver,
  Options as ComponentsOptions,
  ResolvedOptions as ComponentsResolvedOptions,
  ImportInfo,
} from '@uni-helper/vite-plugin-uni-components'

export type {
  definePage,
  PagePath,
  UserOptions as PagesPluginOptions,
  ResolvedOptions as PagesResolvedOptions,
  SubPageMetaDatum,
} from '@uni-helper/vite-plugin-uni-pages'

export type { Options as AutoImportOptions } from 'unplugin-auto-import/types'
