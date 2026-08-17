import { UNIVA_ID } from '../constant'

/**
 * Univa 调试日志
 *
 * 通过 univa.config.ts 的 debug: true 开启，默认关闭。
 * 使用 setDebug() 在 Univa() 初始化阶段设置全局开关。
 */

let debugMode = false

export function setDebug(enabled: boolean): void {
  debugMode = enabled
}

export function log(message: string, ...args: unknown[]): void {
  if (debugMode) {
    console.log(`[${UNIVA_ID}]`, message, ...args)
  }
}
