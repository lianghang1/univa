/**
 * Univa 类型定义统一导出
 *
 * 设计哲学：融合约定为主路径，overrides 为底层逃生口
 * - 高层字段（dirs/imports）面向 90% 用户，降低心智成本
 * - overrides 逃生口面向 10% 高级用户，可下沉到底层插件选项
 */

export type * from './config'
export type * from './context'
export type * from './hooks'
export type * from './overrides'

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
export type { UserUniPresetOptions } from '@uni-helper/unocss-preset-uni'
// 重导出底层插件选项类型（用于 overrides 逃生口）
export type { Options as ComponentsOptions } from '@uni-helper/vite-plugin-uni-components'
// 重导出工具类型
export type {
  ComponentInfo,
  ComponentResolver,
  ResolvedOptions as ComponentsResolvedOptions,
  ImportInfo,
} from '@uni-helper/vite-plugin-uni-components'
export type { UserOptions as PagesPluginOptions } from '@uni-helper/vite-plugin-uni-pages'

export type {
  definePage,
  InternalPages,
  PageContext,
  PagePath,
  ResolvedOptions as PagesResolvedOptions,
  SubPackages,
} from '@uni-helper/vite-plugin-uni-pages'

export type { ConfigBase as UnoCSSConfigBase } from 'unocss'

export type { Options as AutoImportOptions } from 'unplugin-auto-import/types'
