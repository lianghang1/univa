import type { ResolvedOptions } from '../types'
import VitePluginUniComponents from '@uni-helper/vite-plugin-uni-components'
import { UNIVA_DIR_NAME } from '../constant'

/**
 * 创建 Components 模块插件
 *
 * 导入源（componentDirs/componentResolvers）已在 config/resolve 中拆分完成，
 * 此处只做选项拼装。
 */
export function createComponentsPlugin(resolved: ResolvedOptions) {
  return VitePluginUniComponents({
    dirs: resolved.imports.componentDirs,
    resolvers: resolved.imports.componentResolvers,
    dts: `${UNIVA_DIR_NAME}/components.d.ts`,
    globalNamespaces: ['components', 'common'],
    directoryAsNamespace: true,
    ...resolved.overrides.components,
  })
}
