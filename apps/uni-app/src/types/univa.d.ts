declare module '@univa/core' {
  interface RootInstance {
    /**
     * 提示
     * @param msg 提示信息
     * @returns
     */
    showToast: (msg: string) => void
  }
}

export {}
