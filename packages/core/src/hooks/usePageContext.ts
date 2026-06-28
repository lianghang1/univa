import type { PageContext } from '../types/hooks'
import { onMounted, shallowRef } from 'vue'

export function usePageContext(): PageContext {
  const rootRef = shallowRef(null)

  onMounted(() => {
    // @ts-expect-error getCurrentPages 是 uni-app 提供的 API，类型为 Page[]
    const pagesStack = getCurrentPages()
    const pageStack = pagesStack[pagesStack.length - 1]

    if (!pageStack?.$vm?.$refs?.uniKuRoot) {
      throw new Error('[usePageContext] Root not found.')
    }

    rootRef.value = pageStack.$vm.$refs.uniKuRoot
  })

  return {
    rootRef,
  }
}
