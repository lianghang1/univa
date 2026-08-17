import type { Jiti } from 'jiti'
import type { UnivaOptions } from '../types'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { createJiti } from 'jiti'
import { UNIVA_ID } from '../constant'
import { log } from '../utils/logger'
import { mergeWithArrayOverride } from '../utils/merge'

export interface LoadedUserConfig {
  config: UnivaOptions
  configFile?: string
}

/** 配置文件扩展名探测优先级（TS 优先，符合项目定位） */
const CONFIG_EXTENSIONS = ['.ts', '.mts', '.cts', '.js', '.mjs', '.cjs', '.json']

/**
 * 探测配置文件路径
 *
 * 按优先级尝试 univa.config.{ts,mts,cts,js,mjs,cjs,json}
 */
function resolveConfigFilePath(root: string): string | undefined {
  for (const ext of CONFIG_EXTENSIONS) {
    const filePath = join(root, `${UNIVA_ID}.config${ext}`)
    if (existsSync(filePath)) {
      return filePath
    }
  }
}

/**
 * 同步加载 univa.config.*（jiti，支持 TS/JS/JSON）
 *
 * 初始化与热更新共用此方法，保证两个时机行为完全一致：
 * - 初始化：Univa() 在 vite.config 求值阶段同步执行（Vite 插件数组同步构建，无法 await）
 * - 热更新：watcher change 回调重新加载
 *
 * 配置文件不存在 → 空配置走全默认约定（正常场景）
 * 配置文件语法错误 → 记录日志并回退空配置，不阻断构建
 */
export function loadUserConfig(root: string): LoadedUserConfig {
  const jiti: Jiti = createJiti(root)
  const configFile = resolveConfigFilePath(root)

  if (!configFile) {
    return { config: {} }
  }

  try {
    const configModule = jiti(configFile)
    const userConfig = configModule?.default || configModule
    return { config: mergeWithArrayOverride({}, userConfig), configFile }
  }
  catch (e) {
    log(`加载配置文件失败，使用默认配置：${configFile}`, e)
    return { config: {} }
  }
}
