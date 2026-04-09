import { createApp, type App as VueApp, nextTick } from 'vue'
import { createPinia } from 'pinia'
import TDesign from 'tdesign-vue-next'
import 'tdesign-vue-next/es/style/index.css'
import App from './App.vue'
import { createQmRouter, getQmMenuRoutes } from './router'
import { createMemoryHistory, createWebHashHistory, type Router } from 'vue-router'

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
}

type QmChildApi = {
  getMenu: () => unknown[]
  getCurrentRoute: () => string
  navigate: (path: string) => void
}

let app: VueApp | null = null
let router: Router | null = null
let microHashChangeHandler: (() => void) | null = null
let removeRouterAfterEach: (() => void) | null = null
let currentProps: QmProps = {}

const normalizeRoutePath = (path?: string): string => {
  if (!path) return '/quality/report'
  return path.startsWith('/') ? path : `/${path}`
}

const getPathFromHostHash = (): string => {
  const hash = window.location.hash || ''
  const qmPrefix = '#/qm'
  if (!hash.startsWith(qmPrefix)) return '/quality/report'
  return normalizeRoutePath(hash.slice(qmPrefix.length))
}

const applyContext = (props: QmProps = {}) => {
  if (typeof props.accessToken === 'string' && props.accessToken) {
    localStorage.setItem('accessToken', props.accessToken)
  }

  window.dispatchEvent(new CustomEvent('qm:init', {
    detail: {
      accessToken: props.accessToken,
      user: props.user,
      locale: props.locale,
      theme: props.theme,
    },
  }))
}

const bindBridge = (props: QmProps = {}) => {
  window.qmBridge = {
    navigateHome: () => props.onNavigateHome?.(),
    navigate: (path: string) => props.onNavigate?.(path),
    getCurrentRoute: () => router?.currentRoute.value.fullPath || '/quality/report',
    logout: () => props.onLogout?.(),
    notify: (message: string, level: string = 'info', title = '业务消息') =>
      props.onNotify?.(message, level, title),
  }
}

const createChildApi = (): QmChildApi => ({
  getMenu: () => getQmMenuRoutes(),
  getCurrentRoute: () => router?.currentRoute.value.fullPath || '/quality/report',
  navigate: (path: string) => {
    const nextPath = normalizeRoutePath(path)
    void router?.replace(nextPath)
  },
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
  app.use(TDesign)
  app.mount(container)

  bindBridge(currentProps)
  applyContext(props)

  // 等待路由挂载完成后再导航
  await nextTick()
  const targetPath = isMicro ? getPathFromHostHash() : normalizeRoutePath(props.initialPath)
  await router.replace(targetPath)

  // 微前端模式下：主应用 hash 变化时，同步子应用 memory 路由
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
    // 首次挂载立即同步一次，覆盖“直接输入地址”不触发 hashchange 的场景
    await syncFromHostHash()
  }

  if (isMicro) {
    const childApi = createChildApi()
    props.onChildReady?.(childApi)
    props.onMenuUpdate?.(childApi.getMenu())
  }
}

export async function bootstrap() {
  // no-op, reserved for qiankun lifecycle
}

export async function mount(props: QmProps = {}) {
  // 处理嵌入模式
  if ((props as any).hideMenu && (props as any).embedded) {
    document.body.classList.add('embedded-mode')
  }
  
  await render(props, true)
}

export async function unmount() {
  // 移除嵌入模式样式
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

if (!(window as any).__POWERED_BY_QIANKUN__) {
  render({}, false)
}

// qiankun 生命周期导出
;(window as any).__POWERED_BY_QIANKUN__ = true
;(window as any).bootstrap = bootstrap
;(window as any).mount = mount
;(window as any).unmount = unmount
;(window as any).update = update
// 兼容 qiankun 对子应用 name 对应全局导出的生命周期探测
;(window as any)['qm-system'] = { bootstrap, mount, unmount, update }
