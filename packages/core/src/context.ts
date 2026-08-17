import type { ViteDevServer } from 'vite'
import type { ResolvedOptions, UnivaOptions, UnivaPluginHooks } from './types'
import { slash } from '@antfu/utils'
import { loadUserConfig, resolveOptions } from './config'
import { log, setDebug } from './utils/logger'

/**
 * Univa Context
 *
 * 配置生命周期编排者：加载 → 解析 → 分发。只做编排，不实现细节：
 * - 加载/解析委托 config 域（loader / resolve）
 * - 监听 univa.config.ts 变化，通知所有注册了 onConfigUpdate 的插件模块
 * - 触发 HMR 全量刷新
 *
 * 生成文件（.univa/pages-config.ts 等）由各插件模块自治维护，
 * 单个模块更新失败只记录日志，不影响其他模块。
 */
export class UnivaContext {
  private _server: ViteDevServer | undefined
  private _config?: UnivaOptions
  private _configPath?: string
  private _resolved?: ResolvedOptions
  private _pluginHooks: UnivaPluginHooks[] = []

  /** 项目根目录（Vite root） */
  root: string

  constructor(options: { root: string }) {
    this.root = options.root
  }

  /**
   * 注册插件模块 hooks
   *
   * 由各 createXxxPlugin 模块调用，配置变化时逐一通知。
   */
  addPluginHooks(hooks: UnivaPluginHooks): void {
    this._pluginHooks.push(hooks)
  }

  /** 创建 hooks 注册器（传入各插件模块） */
  createHookRegistrar() {
    return (hooks: UnivaPluginHooks) => this.addPluginHooks(hooks)
  }

  /** 加载配置（初始化与热更新共用，失败回退默认约定） */
  loadUserConfig() {
    const { config, configFile } = loadUserConfig(this.root)
    this.resolveConfig(config, configFile)
  }

  /**
   * 解析配置
   *
   * 加载完成后统一收口：存储原始配置 → resolveOptions 产出"全熟"配置 → 同步 debug 开关。
   */
  resolveConfig(userConfig: UnivaOptions, configFile?: string) {
    this._config = userConfig
    this._configPath = configFile
    this._resolved = resolveOptions(userConfig, this.root)
    setDebug(this._resolved.debug)
  }

  /** 获取解析后的配置 */
  get resolveUserOptions() {
    return this._resolved
  }

  /** 获取原始配置 */
  get config() {
    return this._config
  }

  /** 获取配置文件路径 */
  get configPath() {
    return this._configPath
  }

  /**
   * 设置 Vite 开发服务器
   *
   * 监听配置文件变化，触发重新加载
   */
  setupViteServer(server: ViteDevServer) {
    if (this._server === server)
      return

    this._server = server
    this.setupWatcher(server.watcher)
  }

  /**
   * 设置文件监听器
   *
   * 监听 univa.config.ts 变化：重新加载配置 → 通知各插件模块 → 触发 HMR
   */
  setupWatcher(watcher: ViteDevServer['watcher']) {
    if (!this._configPath)
      return

    watcher.add(this._configPath)

    watcher.on('change', async (filePath) => {
      if (slash(filePath) !== slash(this._configPath || ''))
        return

      await this.updateConfig()
    })
  }

  /**
   * 更新配置
   *
   * 配置文件变化时：重新加载配置 → 通知所有插件模块 → 触发 HMR
   */
  async updateConfig() {
    this.loadUserConfig()
    await this.applyPluginHooks()
    this.onUpdate()
  }

  /**
   * 通知所有插件模块配置已更新
   *
   * 各模块独立处理（try/catch 隔离），互不影响。
   */
  async applyPluginHooks() {
    const resolved = this._resolved
    if (!resolved)
      return

    for (const hooks of this._pluginHooks) {
      try {
        await hooks.onConfigUpdate?.(resolved)
      }
      catch (e) {
        log('插件模块配置更新失败：', e)
      }
    }
  }

  /**
   * 触发 HMR
   *
   * 配置变化后通知浏览器刷新
   */
  onUpdate() {
    if (!this._server)
      return

    this._server.ws.send({
      type: 'full-reload',
    })
  }
}
