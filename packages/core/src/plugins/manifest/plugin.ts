/**
 * Vendored from @uni-helper/vite-plugin-uni-manifest
 *
 * 上游插件按固定路径读取 manifest 配置，无法满足 Univa 将产物
 * 集中到 .univa/ 目录的约定，故内嵌实现并调整 cwd 指向。
 * 仅复用上游的 ensureManifestJsonExists 与类型定义。
 */
import type { UserManifestConfig } from '@uni-helper/vite-plugin-uni-manifest'
import type { Plugin } from 'vite'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { ensureManifestJsonExists } from '@uni-helper/vite-plugin-uni-manifest'
import { watchConfig } from 'c12'
import { normalizePath } from 'vite'
import { log } from '../../utils/logger'
import { mergeWithArrayOverride } from '../../utils/merge'

interface ManifestOptions {
  /**
   * minify the `manifest.json`
   * @default false
   */
  minify: boolean
  /**
   * insert newline at the end of the `manifest.json`
   * @default false
   */
  insertFinalNewline: boolean
  /**
   * Resolve configuration from this working directory.
   * @default process.env.VITE_ROOT_DIR
   */
  cwd?: string
  /**
   * Merge the manifest config with the default config.
   * @default false
   */
  merge?: boolean
}
/** User-facing options — all fields are optional. */
export interface UserManifestOptions extends Partial<ManifestOptions> {}
/** Fully resolved options with all defaults applied. */
interface ResolvedManifestOptions extends ManifestOptions {}

function resolveManifestOptions(userOptions: UserManifestOptions): ResolvedManifestOptions {
  return {
    minify: false,
    insertFinalNewline: false,
    cwd: process.env.VITE_ROOT_DIR,
    merge: true,
    ...userOptions,
  }
}

function writeManifestJson(config: any = {}, opts?: ResolvedManifestOptions): void {
  const path = resolveManifestJsonPath()
  let mergeContent: Record<string, any> = {}
  if (opts?.merge && existsSync(path)) {
    try {
      const content = readFileSync(path, 'utf-8')
      mergeContent = JSON.parse(content)
    }
    catch (error) {
      log(`manifest.json parse error: ${error}`)
    }
  }
  const content = JSON.stringify(opts?.merge ? mergeWithArrayOverride(config, mergeContent) : config, null, opts?.minify ? 0 : 2) + (opts?.insertFinalNewline ? '\n' : '')
  if (existsSync(path) && readFileSync(path, 'utf-8') === content) {
    return
  }
  writeFileSync(path, content)
}

function resolveManifestJsonPath(): string {
  return normalizePath(
    resolve((process.env.UNI_INPUT_DIR || `${process.cwd()}/src`) as string, 'manifest.json'),
  )
}

class ManifestContext {
  options: ResolvedManifestOptions
  unwatch!: () => Promise<void>
  constructor(options: UserManifestOptions) {
    this.options = resolveManifestOptions(options)
  }

  /**
   * Start watching config sources and perform initial write.
   * Must be called after construction.
   */
  async setup() {
    const { config, unwatch } = await watchConfig<UserManifestConfig>({
      cwd: this.options.cwd,
      name: 'manifest',
      rcFile: false,
      packageJson: false,
      onUpdate: (config) => {
        writeManifestJson(config.newConfig.config, this.options)
      },
    })
    writeManifestJson(config, this.options)

    this.unwatch = unwatch
  }
}

export function VitePluginUniManifest(userOptions: UserManifestOptions = {}): Plugin {
  let ctx: ManifestContext
  return {
    name: 'vite-plugin-uni-manifest',
    // Run before other plugins to ensure manifest.json is ready
    enforce: 'pre',
    async configResolved() {
      // Ensure manifest.json exists before plugin runs, avoiding downstream errors
      ensureManifestJsonExists()
      ctx = new ManifestContext(userOptions)
      await ctx.setup()
    },
    buildEnd: () => ctx?.unwatch(),
  }
}
