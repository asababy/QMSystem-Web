import { createApp, type App as VueApp, nextTick } from 'vue'
import { createPinia } from 'pinia'
import TDesign from 'tdesign-vue-next'
import 'tdesign-vue-next/es/style/index.css'
import '@jovue/ui/style.css'
import './themes/index.css'
import App from './App.vue'
import { createQmRouter, getQmMenuRoutes } from './router'
import { createMemoryHistory, createWebHashHistory, type Router } from 'vue-router'
import i18n, { setLanguage } from './locales'
import { setTheme } from './utils/theme.ts'

let app: VueApp | null = null
let router: Router | null = null

const DEFAULT_HOME_PATH = '/home'
const QM_HOST_BASE = '/qm'

type QmContext = {
  accessToken?: string
  user?: any
  locale?: string
  theme?: string
}

type QmChildApi = {
  getMenu: () => unknown
  getCurrentRoute: () => string
  navigate: (path: string) => Promise<void>
}

type WujieHostProps = QmContext & {
  embedded?: boolean
  initialPath?: string
  onChildReady?: (api: QmChildApi) => void
  onMenuUpdate?: (routes: unknown) => void
}

const normalizeRoutePath = (path?: string): string => {
  if (!path || path === '/') return DEFAULT_HOME_PATH
  return path.startsWith('/') ? path : `/${path}`
}

const normalizeHostPath = (path: string): string => {
  if (!path || path === '/') return '/index'
  return path.startsWith('/') ? path : `/${path}`
}

const getWujieProps = (): WujieHostProps => {
  return (((window as any).$wujie?.props as WujieHostProps | undefined) ?? {})
}

const isEmbeddedMode = (): boolean => {
  return !!(window as any).__POWERED_BY_WUJIE__
    || getWujieProps().embedded === true
    || window.parent !== window
}

const getHostWindow = (): Window => {
  try {
    return window.parent && window.parent !== window ? window.parent : window
  } catch {
    return window
  }
}

const getPathFromHostHash = (): string => {
  const hostWin = getHostWindow()
  const hash = hostWin.location.hash || ''
  const qmPrefix = `#${QM_HOST_BASE}`
  if (!hash.startsWith(qmPrefix)) return DEFAULT_HOME_PATH
  const rawPath = hash.slice(qmPrefix.length)
  return normalizeRoutePath(rawPath)
}

const resolveInitialEmbeddedPath = (): string => {
  const initialPath = getWujieProps().initialPath
  if (initialPath) return normalizeRoutePath(initialPath)
  return getPathFromHostHash()
}

const isHostRoutePath = (path: string): boolean => {
  return /^\/(index|login|403|404|bi|system)(\/|$)/.test(path)
}

const toHostPath = (path: string): string => {
  const normalizedPath = normalizeHostPath(path)

  if (normalizedPath === QM_HOST_BASE || normalizedPath.startsWith(`${QM_HOST_BASE}/`)) {
    return normalizedPath
  }

  if (isHostRoutePath(normalizedPath)) {
    return normalizedPath
  }

  return `${QM_HOST_BASE}${normalizedPath}`.replace(/\/+/g, '/')
}

const syncHostHash = (path: string): void => {
  if (!isEmbeddedMode()) return

  const hostWin = getHostWindow()
  const nextHash = `#${toHostPath(path)}`
  if (hostWin.location.hash !== nextHash) {
    hostWin.location.hash = nextHash
  }
}

const applyContext = (props: QmContext = {}): void => {
  if (typeof props.accessToken === 'string' && props.accessToken) {
    localStorage.setItem('accessToken', props.accessToken)
  }

  if (typeof props.locale === 'string' && props.locale) {
    setLanguage(props.locale)
  }

  if (typeof props.theme === 'string' && props.theme) {
    setTheme(props.theme)
  }

  window.dispatchEvent(new CustomEvent('qm:init', {
    detail: {
      accessToken: props.accessToken,
      user: props.user,
      locale: props.locale || i18n.global.locale.value,
      theme: props.theme,
    },
  }))
}

const initWujieSubApp = () => {
  const wujie = (window as any).$wujie
  if (wujie?.bus) {
    wujie.bus.$on('theme-change', (theme: string) => {
      if (theme) setTheme(theme)
    })
    wujie.bus.$on('locale-change', (lang: string) => {
      if (lang) setLanguage(lang)
    })
  }
}

const createChildApi = (): QmChildApi => ({
  getMenu: () => getQmMenuRoutes(),
  getCurrentRoute: () => router?.currentRoute.value.fullPath || DEFAULT_HOME_PATH,
  navigate: async (path: string) => {
    if (!router) return

    const nextPath = normalizeRoutePath(path)
    if (router.currentRoute.value.fullPath !== nextPath) {
      await router.replace(nextPath)
    }
  },
})

const navigateByBridge = (path: string): void => {
  const normalizedPath = normalizeHostPath(path)

  if (isEmbeddedMode()) {
    syncHostHash(normalizedPath)
    return
  }

  if (isHostRoutePath(normalizedPath) || normalizedPath === QM_HOST_BASE || normalizedPath.startsWith(`${QM_HOST_BASE}/`)) {
    window.location.href = normalizedPath
    return
  }

  void router?.replace(normalizeRoutePath(normalizedPath))
}

const exposeHostBridge = (): void => {
  const childApi = createChildApi()
  const wujieProps = getWujieProps()

  window.qmBridge = {
    navigateHome: () => {
      navigateByBridge(DEFAULT_HOME_PATH)
    },
    navigate: (path: string) => {
      navigateByBridge(path)
    },
    getCurrentRoute: () => childApi.getCurrentRoute(),
    logout: () => {
      navigateByBridge('/login')
    },
    notify: (message: string, level = 'info', title?: string) => {
      const prefix = title ? `${title}: ` : ''
      if (level === 'error') {
        console.error(`[QM] ${prefix}${message}`)
        return
      }

      if (level === 'warning') {
        console.warn(`[QM] ${prefix}${message}`)
        return
      }

      console.info(`[QM] ${prefix}${message}`)
    },
  }

  wujieProps.onChildReady?.(childApi)
  wujieProps.onMenuUpdate?.(getQmMenuRoutes())
}

const render = async () => {
  const container = document.querySelector('#app')
  if (!container) return

  const isEmbedded = isEmbeddedMode()
  const pinia = createPinia()
  const history = isEmbedded ? createMemoryHistory() : createWebHashHistory()
  router = createQmRouter(history)

  app = createApp(App)
  app.use(pinia)
  app.use(router)
  app.use(i18n)
  app.use(TDesign)
  app.mount(container)

  initWujieSubApp()
  applyContext(getWujieProps())
  exposeHostBridge()

  await nextTick()
  const targetPath = isEmbedded ? resolveInitialEmbeddedPath() : DEFAULT_HOME_PATH
  await router.replace(targetPath)

  if (isEmbedded) {
    const syncFromHostHash = async () => {
      if (!router) return
      const hostWin = getHostWindow()
      const hash = hostWin.location.hash || ''
      const qmPrefix = `#${QM_HOST_BASE}`
      let rawPath = ''
      if (hash.startsWith(qmPrefix)) {
        rawPath = hash.slice(qmPrefix.length)
      }
      const nextPath = rawPath ? normalizeRoutePath(rawPath) : resolveInitialEmbeddedPath()
      if (router.currentRoute.value.fullPath !== nextPath) {
        await router.replace(nextPath)
      }
    }

    const hostWin = getHostWindow()
    hostWin.addEventListener('hashchange', syncFromHostHash)
    window.addEventListener('hashchange', syncFromHostHash)
    await syncFromHostHash()
  }

  router.afterEach((to) => {
    if (isEmbedded) {
      syncHostHash(to.fullPath)
    }
  })
}

// 自动渲染应用
render()
