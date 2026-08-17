import type { Plugin } from 'vite'
import type { RegisterPluginHooks, ResolvedOptions } from '../../types'
import type { UserManifestOptions } from './plugin'
import { join } from 'node:path'
import process from 'node:process'
import { UNIVA_DIR_NAME } from '../../constant'
import { generateManifestConfigFile } from './generate'
import { VitePluginUniManifest } from './plugin'

export type { UserManifestOptions }

/**
 * 同步 manifest 配置产物（.univa/manifest.config.ts）
 *
 * univa.config.ts 有 manifest 字段时才生成；
 * 配置变化时由 onConfigUpdate 重新生成，vendor 插件的 watchConfig 感知后写入 manifest.json。
 */
function syncManifestConfig(resolved: ResolvedOptions): void {
  if (!resolved.manifest)
    return
  generateManifestConfigFile(resolved.manifest, resolved.root)
}

/**
 * 创建 Manifest 模块插件
 *
 * 首次生成产物在模块创建时同步完成；后续更新通过 hooks 自治处理。
 */
export function createManifestPlugin(resolved: ResolvedOptions, on: RegisterPluginHooks): Plugin {
  syncManifestConfig(resolved)
  on({ onConfigUpdate: syncManifestConfig })

  return VitePluginUniManifest({
    cwd: join(process.env.VITE_ROOT_DIR || '', UNIVA_DIR_NAME),
    ...resolved.overrides.manifest,
  })
}
