/* eslint-disable node/prefer-global/process */
import type { FSWatcher } from 'chokidar'
import type { ViteDevServer } from 'vite'
import type { UnivaConfig } from '../types'
import { slash } from '@antfu/utils'
import { loadConfig } from 'c12'
import { ID } from '../constant'
import { mergeWithArrayOverride } from '../utils/merge'
import { extractPagesJsonContent, generatePagesConfigFile, hasPagesJsonContent } from './pages'

/**
 * Univa Context 类
 * 负责管理配置、监听文件变化、触发生成函数
 */
export class UnivaContext {
  private _server: ViteDevServer | undefined

  config?: UnivaConfig
  configPath: string
  root: string

  constructor(options: { root?: string, config?: UnivaConfig }) {
    this.root = options.root || process.cwd()
    this.configPath = ''
    this.config = options.config || {}
  }

  async loadUserConfig() {
    const { config: userConfig, configFile } = await loadConfig<UnivaConfig>({
      name: ID,
      cwd: this.root,
      defaults: this.config || {},
      merger: mergeWithArrayOverride as any,
    })
    console.log(userConfig)
    this.config = userConfig
    this.configPath = configFile || ''
  }

  /**
   * 设置 Vite 开发服务器
   */
  setupViteServer(server: ViteDevServer) {
    if (this._server === server)
      return

    this._server = server
    this.setupWatcher(server.watcher)
  }

  /**
   * 设置文件监听器
   */
  async setupWatcher(watcher: FSWatcher) {
    watcher.add(this.configPath)

    watcher.on('change', async (filePath) => {
      filePath = slash(filePath)
      const configPath = slash(this.configPath)

      if (filePath !== configPath) {
        return
      }

      await this.updateConfig()

      this.onUpdate()
    })
  }

  async updateConfig() {
    await this.loadUserConfig()
    this.updateGeneratedFiles()
  }

  /**
   * 更新生成的文件
   * 根据配置变化触发相应的生成函数
   */
  updateGeneratedFiles() {
    if (this.config?.pages) {
      const pagesConfig = this.config.pages === true ? {} : this.config.pages
      if (pagesConfig && typeof pagesConfig === 'object' && hasPagesJsonContent(pagesConfig)) {
        const jsonContent = extractPagesJsonContent(pagesConfig)
        if (jsonContent) {
          generatePagesConfigFile(jsonContent, this.root)
        }
      }
    }

    // 未来可以添加其他文件的生成逻辑（例如 manifest.ts 等）
  }

  /**
   * 更新回调
   * 触发 HMR
   */
  onUpdate() {
    if (!this._server) {
      return
    }

    this._server.ws.send({
      type: 'full-reload',
    })
  }
}
