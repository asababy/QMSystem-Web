import { createApp, type App as VueApp, nextTick } from 'vue'
import { createPinia } from 'pinia'
import TDesign from 'tdesign-vue-next'
import 'tdesign-vue-next/es/style/index.css'
import '@jovue/ui/style.css'
import App from './App.vue'
import { createQmRouter, getQmMenuRoutes } from './router'
import { getApiList } from './api/registry'
import { createMemoryHistory, createWebHashHistory, type Router } from 'vue-router'
import i18n, { setLanguage } from './locales'

type QmContext = {
  accessToken?: string
  user?: any
  locale?: string
  theme?: string
}

type QmProps = QmContext & {
  container?: Element
  initialPath?: string
  onNavigateHome?: () => void
  onNavigate?: (path: string) => void
  onMenuUpdate?: (routes: unknown[]) => void
  onChildReady?: (api: QmChildApi) => void
  onLogout?: () => void
  onNotify?: (message: string, level?: string, title?: string) => void
  onGlobalStateChange?: (
    callback: (state: { locale?: string; language?: string }, prevState: { locale?: string; language?: string }) => void,
    fireImmediately?: boolean
  ) => void
  offGlobalStateChange?: () => void
}

type QmChildApi = {
  getMenu: () => unknown[]
  getCurrentRoute: () => string
  navigate: (path: string) => void
  getApis: () => Array<{
    code: string
    name: string
    route: string
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'
    description?: string
    module?: string
  }>
}

let app: VueApp | null = null
let router: Router | null = null
let microHashChangeHandler: (() => void) | null = null
let removeRouterAfterEach: (() => void) | null = null
let offGlobalStateChangeHandler: (() => void) | null = null
let currentProps: QmProps = {}

const DEFAULT_HOME_PATH = '/home'

const normalizeRoutePath = (path?: string): string => {
  if (!path) return DEFAULT_HOME_PATH
  return path.startsWith('/') ? path : `/${path}`
}

const getPathFromHostHash = (): string => {
  const hash = window.location.hash || ''
  const qmPrefix = '#/qm'
  if (!hash.startsWith(qmPrefix)) return DEFAULT_HOME_PATH
  return normalizeRoutePath(hash.slice(qmPrefix.length))
}

const applyContext = (props: QmProps = {}) => {
  if (typeof props.accessToken === 'string' && props.accessToken) {
    localStorage.setItem('accessToken', props.accessToken)
  }
  if (typeof props.locale === 'string' && props.locale) {
    setLanguage(props.locale)
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

const bindBridge = (props: QmProps = {}) => {
  window.qmBridge = {
    navigateHome: () => props.onNavigateHome?.(),
    navigate: (path: string) => props.onNavigate?.(path),
    getCurrentRoute: () => router?.currentRoute.value.fullPath || DEFAULT_HOME_PATH,
    logout: () => props.onLogout?.(),
    notify: (message: string, level: string = 'info', title = String(i18n.global.t('app.notifyTitle'))) =>
      props.onNotify?.(message, level, title),
  }
}

const createChildApi = (): QmChildApi => ({
  getMenu: () => getQmMenuRoutes(),
  getCurrentRoute: () => router?.currentRoute.value.fullPath || DEFAULT_HOME_PATH,
  navigate: (path: string) => {
    const nextPath = normalizeRoutePath(path)
    void router?.replace(nextPath)
  },
  getApis: () => getApiList()
})

const render = async (props: QmProps = {}, isMicro = false) => {
  currentProps = props
  const container = props.container
    ? (props.container.querySelector('#app') as HTMLElement | null)
    : document.querySelector('#app')

  if (!container) return

  const pinia = createPinia()
  const history = isMicro ? createMemoryHistory() : createWebHashHistory()
  router = createQmRouter(history)
  if (removeRouterAfterEach) {
    removeRouterAfterEach()
    removeRouterAfterEach = null
  }
  removeRouterAfterEach = router.afterEach((to) => {
    currentProps.onNavigate?.(to.fullPath)
  })
  app = createApp(App)
  app.use(pinia)
  app.use(router)
  app.use(i18n)
  app.use(TDesign)
  app.mount(container)

  bindBridge(currentProps)
  applyContext(props)

  // 绛夊緟璺敱鎸傝浇瀹屾垚鍚庡啀瀵艰埅
  await nextTick()
  const targetPath = isMicro ? getPathFromHostHash() : normalizeRoutePath(props.initialPath)
  await router.replace(targetPath)

  // 寰墠绔ā寮忎笅锛氫富搴旂敤 hash 鍙樺寲鏃讹紝鍚屾瀛愬簲鐢?memory 璺敱
  if (isMicro) {
    const syncFromHostHash = async () => {
      if (!router) return

      const hash = window.location.hash || ''
      const qmPrefix = '#/qm'
      if (!hash.startsWith(qmPrefix)) return

      const nextPath = normalizeRoutePath(hash.slice(qmPrefix.length))
      if (router.currentRoute.value.fullPath !== nextPath) {
        await router.replace(nextPath)
      }
    }

    microHashChangeHandler = () => {
      void syncFromHostHash()
    }

    window.addEventListener('hashchange', microHashChangeHandler)
    // 棣栨鎸傝浇绔嬪嵆鍚屾涓€娆★紝瑕嗙洊鈥滅洿鎺ヨ緭鍏ュ湴鍧€鈥濅笉瑙﹀彂 hashchange 鐨勫満鏅?    await syncFromHostHash()
  }

  if (isMicro) {
    if (typeof props.onGlobalStateChange === 'function') {
      props.onGlobalStateChange((state) => {
        const lang = state?.language || state?.locale
        if (lang) {
          setLanguage(lang)
        }
      }, true)
      offGlobalStateChangeHandler = () => {
        props.offGlobalStateChange?.()
      }
    }

    const childApi = createChildApi()
    props.onChildReady?.(childApi)
    props.onMenuUpdate?.(childApi.getMenu())
  }
}

export async function bootstrap() {
  // reserved for qiankun lifecycle
}

export async function mount(props: QmProps = {}) {
  // 澶勭悊宓屽叆妯″紡
  if ((props as any).hideMenu && (props as any).embedded) {
    document.body.classList.add('embedded-mode')
  }

  await render(props, true)
}

export async function unmount() {
  // 绉婚櫎宓屽叆妯″紡鏍峰紡
  document.body.classList.remove('embedded-mode')

  if (!app) return
  if (microHashChangeHandler) {
    window.removeEventListener('hashchange', microHashChangeHandler)
    microHashChangeHandler = null
  }
  if (removeRouterAfterEach) {
    removeRouterAfterEach()
    removeRouterAfterEach = null
  }
  if (offGlobalStateChangeHandler) {
    offGlobalStateChangeHandler()
    offGlobalStateChangeHandler = null
  }
  app.unmount()
  app = null
  router = null
  currentProps = {}
  delete window.qmBridge
}

export async function update(props: QmProps = {}) {
  currentProps = { ...currentProps, ...props }
  bindBridge(currentProps)
  applyContext(props)
  if ((props.onChildReady || props.onMenuUpdate) && router) {
    const childApi = createChildApi()
    currentProps.onChildReady?.(childApi)
    currentProps.onMenuUpdate?.(childApi.getMenu())
  }
  if (router && props.initialPath) {
    const nextPath = normalizeRoutePath(props.initialPath)
    if (router.currentRoute.value.fullPath !== nextPath) {
      await router.replace(nextPath)
    }
  }
}

// vite-plugin-qiankun 鐢熷懡鍛ㄦ湡娉ㄥ唽锛堝紑鍙戞ā寮?ESM 鍏煎 + 鐢熶骇妯″紡閫氱敤锛塦r
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

renderWithQiankun({
  bootstrap,
  mount,
  unmount,
  update,
})

// 鐙珛杩愯妯″紡锛堥潪 qiankun 鍔犺浇鏃剁洿鎺ユ覆鏌擄級
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render({}, false)
}

