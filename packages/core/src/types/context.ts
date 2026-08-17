import type { ResolvedOptions } from './config'

/**
 * 插件模块生命周期 hooks
 *
 * 每个插件模块（pages/manifest/...）通过 RegisterPluginHooks 注册，
 * 由 UnivaContext 在配置变化时统一通知，各模块独立处理、互不影响。
 */
export interface UnivaPluginHooks {
  /**
   * univa.config.ts 变化并重新解析后调用
   *
   * 模块在此回调中更新自己负责的生成文件（.univa/pages-config.ts 等），
   * 单个模块抛错只记录日志，不影响其他模块与构建流程。
   */
  onConfigUpdate?: (resolved: ResolvedOptions) => void | Promise<void>
}

/** hooks 注册器，由 UnivaContext 提供 */
export type RegisterPluginHooks = (hooks: UnivaPluginHooks) => void
