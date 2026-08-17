import type { ResolvedOptions } from '../types'
import Optimization from '@uni-ku/bundle-optimizer'

/**
 * 创建 Bundle Optimization 模块插件
 */
export function createOptimizationPlugin(resolved: ResolvedOptions) {
  return Optimization({
    enable: true,
    logger: resolved.debug,
    ...resolved.overrides.optimization,
  })
}
