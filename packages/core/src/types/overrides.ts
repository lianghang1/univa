import type { Options as ComponentsOptions } from '@uni-helper/vite-plugin-uni-components'
import type { UserOptions as PagesPluginOptions } from '@uni-helper/vite-plugin-uni-pages'
import type { IOptions as OptimizerOptions } from '@uni-ku/bundle-optimizer'
import type { ConfigBase as UnoCSSConfigBase } from 'unocss'
import type { Options as AutoImportOptions } from 'unplugin-auto-import/types'
import type { UserManifestOptions } from '../plugins/manifest'

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
