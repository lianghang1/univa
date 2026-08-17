import type { ResolvedOptions } from '../types'
import { VitePluginUniLayouts } from '@uni-helper/vite-plugin-uni-layouts'

/**
 * 创建 Layouts 模块插件
 */
export function createLayoutsPlugin(resolved: ResolvedOptions) {
  return VitePluginUniLayouts({
    layoutDir: resolved.dirs.layouts,
    ...resolved.overrides.layouts,
  })
}
