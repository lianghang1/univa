import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { UNIVA_DIR_NAME } from '../constant'

/**
 * 确保目录存在
 */
export function ensureDir(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}

/**
 * 获取 .univa 目录路径
 * 所有自动生成的文件都存放在这里
 */
export function getUnivaDir(cwd: string): string {
  return join(cwd, UNIVA_DIR_NAME)
}

/**
 * 确保 .univa 目录存在
 */
export function ensureUnivaDir(cwd: string): string {
  const dir = getUnivaDir(cwd)
  ensureDir(dir)
  return dir
}
