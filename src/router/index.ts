import { createRouter, type RouterHistory, type RouteRecordRaw } from 'vue-router'
import qms_menu from './qms_menu.json';

type JsonRoute = {
  name?: string;
  path?: string;
  meta?: Record<string, any>;
  component?: string;
  redirect?: string;
  children?: JsonRoute[];
  [key: string]: any;
};

const views = import.meta.glob('../views/**/*.vue');

const resolveComponent = (componentPath?: string) => {
  if (!componentPath) return undefined;
  const normalizedPath = componentPath.replace(/^@\//, '../');
  const component = views[normalizedPath];
  if (!component) {
    return undefined;
  }
  return component;
};

const normalizeJsonRoutes = (routes: JsonRoute[]): RouteRecordRaw[] => {
  return routes
    .map((item) => {
      const route: any = { ...item };
      if (typeof route.component === 'string') {
        const component = resolveComponent(route.component);
        if (!component) return undefined;
        route.component = component;
      }
      if (Array.isArray(route.children)) {
        route.children = normalizeJsonRoutes(route.children as JsonRoute[]);
      }
      return route as RouteRecordRaw;
    })
    .filter((route): route is RouteRecordRaw => route !== undefined);
};

// QM 系统基础路由（JSON 配置）
const qmBaseRoutes: RouteRecordRaw[] = normalizeJsonRoutes(qms_menu as JsonRoute[]);

export const createQmRouter = (history: RouterHistory) => {
  const router = createRouter({
    history,
    routes: qmBaseRoutes,
  })

  router.onError((error) => {
    console.error('[QM Router Error]', error)
    if (router.currentRoute.value.path !== '/quality/not-found') {
      void router.replace('/quality/not-found')
    }
  })

  return router
}

export { qmBaseRoutes }
export const getQmMenuRoutes = (): JsonRoute[] =>
  JSON.parse(JSON.stringify(qms_menu as JsonRoute[]))
