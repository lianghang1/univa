import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { join, posix } from 'node:path'
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

/**
 * 获取目录下的所有子目录名称
 * @param dirPath 要扫描的目录绝对路径
 * @returns 子目录名称数组（不含路径）
 */
export function getSubDirectories(dirPath: string): string[] {
  if (!existsSync(dirPath)) {
    return []
  }

  const entries = readdirSync(dirPath)
  return entries.filter((entry) => {
    const fullPath = join(dirPath, entry)
    return statSync(fullPath).isDirectory()
  })
}

/**
 * 扫描分包根目录下的所有分包目录
 * @param srcDir 源码目录绝对路径
 * @param subPackageRoot 分包根目录名称（如 'pages-sub'）
 * @returns 分包路径数组（相对 srcDir，POSIX 格式，如 ['pages-sub/demo', 'pages-sub/user']）
 */
export function scanSubPackages(srcDir: string, subPackageRoot: string): string[] {
  const rootPath = join(srcDir, subPackageRoot)
  const subDirs = getSubDirectories(rootPath)

  // 使用 POSIX 格式（/）分隔符，保证 glob 匹配兼容性
  return subDirs.map(name => posix.join(subPackageRoot, name))
}
