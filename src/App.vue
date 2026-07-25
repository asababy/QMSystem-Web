<template>
  <div class="qm-app" :data-embedded="isEmbedded" :data-theme="currentTheme" :theme-mode="currentTheme">
    <router-view v-slot="{ Component, route }">
      <keep-alive :include="keepAliveRouteNames">
        <component :is="Component" :key="route.fullPath" />
      </keep-alive>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { currentTheme } from './utils/theme'

const router = useRouter()
const isEmbedded = computed(() => !!(window as any).__POWERED_BY_WUJIE__ || window.parent !== window)

// 根据静态配置初始化 keep-alive 页面路由名
const staticKeepAliveNames = router.getRoutes()
  .filter(route => route.meta?.isKeepAlive && route.name)
  .map(route => String(route.name))

const activeKeepAliveNames = ref<string[]>([...staticKeepAliveNames])

const keepAliveRouteNames = computed(() => activeKeepAliveNames.value)

// 宿主关闭 Tab 时的监听器
const handleHostTabClose = (e: Event) => {
  const customEvent = e as CustomEvent<{ path: string }>;
  const hostPath = customEvent.detail?.path;
  if (!hostPath) return;

  // 将 hostPath (e.g. /qm/quality/coa) 转换为子应用内部相对路径 (e.g. /quality/coa)
  const qmPrefix = '/qm';
  const relativePath = hostPath.startsWith(qmPrefix)
    ? hostPath.slice(qmPrefix.length)
    : hostPath;

  // 通过 vue-router 匹配到具体的子应用路由对象，获取其 name
  const matched = router.resolve(relativePath);
  if (matched && matched.name) {
    const routeName = String(matched.name);

    // 从活动缓存列表中移除该组件的 name，Vue 的 keep-alive 会自动销毁对应的缓存
    activeKeepAliveNames.value = activeKeepAliveNames.value.filter(
      name => name !== routeName
    );
  }
}

const handleWujieTabClose = (data: { path: string }) => {
  if (data?.path) {
    handleHostTabClose({ detail: data } as any)
  }
}

// 重新激活路由时，如果它本身声明了 keepAlive，重新加入缓存池
const removeAfterEach = router.afterEach((to) => {
  if (to.meta?.isKeepAlive && to.name) {
    const name = String(to.name);
    if (!activeKeepAliveNames.value.includes(name)) {
      activeKeepAliveNames.value.push(name);
    }
  }
})

onMounted(() => {
  window.addEventListener('wujie-tab-close', handleHostTabClose)
  const wujie = (window as any).$wujie
  if (wujie?.bus) {
    wujie.bus.$on('tab-close', handleWujieTabClose)
  }
})

onUnmounted(() => {
  window.removeEventListener('wujie-tab-close', handleHostTabClose)
  const wujie = (window as any).$wujie
  if (wujie?.bus) {
    wujie.bus.$off('tab-close', handleWujieTabClose)
  }
  removeAfterEach()
})
</script>

<style>
@import './styles/animations.css';

/* 子应用根容器样式，避免污染主应用全局 */
.qm-app {
  box-sizing: border-box;
  color: var(--text-main);
  width: 100%;
  height: 100%;
  overflow: auto;
}
</style>
