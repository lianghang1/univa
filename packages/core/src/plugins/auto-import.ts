import type { PluginOption } from 'vite'
import type { ResolvedOptions } from '../types'
import AutoImport from 'unplugin-auto-import/vite'
import { UNIVA_DIR_NAME } from '../constant'

/**
 * 创建 AutoImport 模块插件
 *
 * 导入源（apiPresets/apiDirs）已在 config/resolve 中拆分完成，
 * 此处只做选项拼装。
 */
export function createAutoImportPlugin(resolved: ResolvedOptions): PluginOption[] {
  const plugin = AutoImport({
    imports: resolved.imports.apiPresets as any,
    dirs: resolved.imports.apiDirs,
    dts: `${UNIVA_DIR_NAME}/auto-imports.d.ts`,
    ...resolved.overrides.autoImport,
  }) as any

  return Array.isArray(plugin) ? plugin : [plugin]
}
