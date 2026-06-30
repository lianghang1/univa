import type { PageContext } from '../types/hooks'
import { onMounted, shallowRef } from 'vue'

export function usePageContext(): PageContext {
  const rootRef = shallowRef(null)

  onMounted(() => {
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
