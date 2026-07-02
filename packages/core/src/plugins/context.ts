import type { Jiti } from 'jiti'
import type { ViteDevServer } from 'vite'
import type { PagesConfig, ResolvedOptions, UnivaOptions } from '../types'
import { join } from 'node:path'
import { slash } from '@antfu/utils'
import { loadConfig } from 'c12'
import { createJiti } from 'jiti'
import { ID } from '../constant'
import { log } from '../utils/logger'
import { mergeWithArrayOverride } from '../utils/merge'
import { generateManifestConfigFile } from './manifest'
import { resolveOptions } from './options'
import { generatePagesConfigFile } from './pages'

/**
 * Univa Context 类
 *
 * 负责管理配置生命周期：
 * - 加载配置（同步/异步）
 * - 解析配置（应用默认值、扫描目录）
 * - 监听配置变化
 * - 生成依赖文件
 */
export class UnivaContext {
  private _server: ViteDevServer | undefined
  private _config?: UnivaOptions
  private _configPath?: string
  private _jiti?: Jiti
  private _resolveUserOptions?: ResolvedOptions

  /** 项目根目录（Vite root） */
  root: string

  constructor(options: { root: string }) {
    this.root = options.root
    this._jiti = createJiti(this.root)
  }

  /**
   * 异步加载配置（c12）
   *
   * 支持更多格式：JSON/YAML/远程配置等
   * 用于配置文件变化时重新加载
   */
  async loadUserConfig() {
    const { config: userConfig, configFile } = await loadConfig<UnivaOptions>({
      name: ID,
      cwd: this.root,
      defaults: this._config || {},
      merger: mergeWithArrayOverride as any,
    })

    this.resolveConfig(userConfig, configFile)
  }

  /**
   * 同步加载配置（jiti）
   *
   * 用于插件初始化阶段，确保配置在插件创建前可用
   */
  loadUserConfigSync() {
    if (!this._jiti) {
      log('Jiti 未初始化，无法加载配置')
      return
    }

    const configFile = join(this.root, `${ID}.config`)
    try {
      const configModule = this._jiti(configFile)
      const userConfig = configModule?.default || configModule
      this.resolveConfig(mergeWithArrayOverride({}, userConfig), configFile)
    }
    catch (e) {
      log(`加载配置文件失败：${configFile}`, e)
    }
  }

  /**
   * 解析配置
   *
   * 统一处理配置加载后的逻辑：
   * - 存储 raw config
   * - 解析为 resolved options（应用默认值、扫描目录）
   */
  resolveConfig(userConfig: UnivaOptions, configFile?: string) {
    this._config = userConfig
    this._configPath = configFile || ''
    this._resolveUserOptions = resolveOptions(userConfig, this.root)
  }

  /** 获取解析后的配置 */
  get resolveUserOptions() {
    return this._resolveUserOptions
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
   * 监听 univa.config.ts 变化：
   * - 重新加载配置
   * - 更新生成文件
   * - 触发 HMR
   */
  setupWatcher(watcher: ViteDevServer['watcher']) {
    if (!this._configPath)
      return

    watcher.add(this._configPath)

    watcher.on('change', async (filePath) => {
      if (slash(filePath) !== slash(this._configPath || ''))
        return

      await this.updateConfig()
      this.onUpdate()
    })
  }

  /**
   * 更新配置
   *
   * 配置文件变化时：
   * - 异步加载新配置
   * - 更新生成文件
   */
  async updateConfig() {
    await this.loadUserConfig()
    this.updateGeneratedFiles()
  }

  /**
   * 更新生成文件
   *
   * 根据配置生成：
   * - .univa/pages-config.ts（VitePluginUniPages 依赖）
   * - .univa/manifest-config.ts（可选）
   */
  updateGeneratedFiles() {
    const resolved = this._resolveUserOptions
    if (!resolved)
      return

    // 构建 pages 配置
    const pagesConfig: Partial<PagesConfig> = resolved.pages || {}

    // 将 homePage 插入到 pages 数组开头
    if (resolved.homePage) {
      pagesConfig.pages = pagesConfig.pages || []
      pagesConfig.pages.unshift(resolved.homePage)
      log(`已插入首页配置：${JSON.stringify(resolved.homePage)}`)
    }

    log(`生成 pages 配置：${JSON.stringify(pagesConfig)}`)
    generatePagesConfigFile(pagesConfig, this.root, resolved)

    // 生成 manifest 配置（可选）
    const manifestConfig = resolved.manifest
    if (manifestConfig) {
      generateManifestConfigFile(manifestConfig, this.root)
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