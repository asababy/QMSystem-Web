export {}

declare global {
  interface Window {
    __POWERED_BY_QIANKUN__?: boolean
  }

  interface Window {
    qmBridge?: {
      navigateHome: () => void
      navigate: (path: string) => void
      getCurrentRoute: () => string
      logout: () => void
      notify: (message: string, level?: string, title?: string) => void
    }
  }
}
