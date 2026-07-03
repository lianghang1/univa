import type { Ref, ShallowRef } from 'vue'

/**
 * Root 组件实例接口（可扩展）
 *
 * 用户可通过模块增强扩展此接口：
 * ```ts
 * declare module '@univa/core' {
 *   interface RootInstance {
 *     showToast: (msg: string) => void
 *     navigateToHome: () => void
 *   }
 * }
 * ```
 */
export interface RootInstance {}

export interface PageContext {
  rootRef: ShallowRef<RootInstance | null>
  isMounted: Ref<boolean>

  onPageMounted: (callback: () => void) => void
  onPageUnmounted: (callback: () => void) => void
  onPageShowAfterMounted: (callback: () => void) => void
}