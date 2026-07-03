import type { PageContext } from '../types/hooks'
import { onShow } from '@dcloudio/uni-app'
import { onMounted, onUnmounted, ref, shallowRef } from 'vue'

/**
 * 获取当前页面的 root 组件上下文
 *
 * root 组件（App.ku.vue）通过 defineExpose 暴露的方法可通过 rootRef.value 访问
 * 每个页面都有独立的 root 实例，方法绑定到对应实例
 *
 * @example
 * ```vue
 * <!-- App.ku.vue (root 组件) -->
 * <script setup lang="ts">
 * // 扩展类型声明（在项目的 d.ts 文件中）
 * declare module '@univa/core' {
 *   interface RootInstance {
 *     showToast: (msg: string) => void
 *     navigateToHome: () => void
 *   }
 * }
 *
 * // 使用 defineExpose 暴露方法
 * defineExpose({
 *   showToast: (msg) => {
 *     uni.showToast({ title: msg, icon: 'none' })
 *   },
 *   navigateToHome: () => {
 *     uni.switchTab({ url: '/pages/index/index' })
 *   }
 * })
 * </script>
 *
 * <!-- 页面中使用 -->
 * <script setup lang="ts">
 * import { usePageContext } from '@univa/core'
 * import { onMounted } from 'vue'
 *
 * const { rootRef } = usePageContext()
 *
 * onMounted(() => {
 *   // 通过 rootRef.value 访问方法，有完整的 TS 支持
 *   rootRef.value?.showToast('hello')
 *   rootRef.value?.navigateToHome()
 * })
 * </script>
 * ```
 */
export function usePageContext(): PageContext {
  const rootRef = shallowRef(null)
  const isMounted = ref(false)

  // 生命周期回调队列
  const mountedCallbacks: (() => void)[] = []
  const unmountedCallbacks: (() => void)[] = []
  const showAfterMountedCallbacks: (() => void)[] = []

  // 注册页面挂载成功后的每次显示时执行回调
  const onPageShowAfterMounted = (callback: () => void) => {
    showAfterMountedCallbacks.push(callback)
  }

  // 注册页面挂载回调
  const onPageMounted = (callback: () => void) => {
    mountedCallbacks.push(callback)
  }

  // 注册页面卸载回调
  const onPageUnmounted = (callback: () => void) => {
    unmountedCallbacks.push(callback)
  }

  onShow(() => {
    if (isMounted.value) {
      showAfterMountedCallbacks.forEach(cb => cb())
    }
  })

  onUnmounted(() => {
    isMounted.value = false

    unmountedCallbacks.forEach(cb => cb())

    mountedCallbacks.length = 0
    unmountedCallbacks.length = 0
    showAfterMountedCallbacks.length = 0
  })

  onMounted(() => {
    const pagesStack = getCurrentPages()
    const pageStack = pagesStack[pagesStack.length - 1]

    if (!pageStack?.$vm?.$refs?.uniKuRoot) {
      throw new Error('[usePageContext] Root not found.')
    }

    rootRef.value = pageStack.$vm.$refs.uniKuRoot

    isMounted.value = true
    mountedCallbacks.forEach(cb => cb())
  })

  return {
    rootRef,
    isMounted,

    onPageMounted,
    onPageUnmounted,
    onPageShowAfterMounted,
  }
}
