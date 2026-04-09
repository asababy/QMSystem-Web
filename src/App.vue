<template>
  <t-config-provider :global-config="{ locale: zhCN }">
    <div class="qm-app">
      <router-view v-slot="{ Component, route }">
        <keep-alive :include="keepAliveRouteNames">
          <component
            :is="Component"
            :key="route.fullPath"
          />
        </keep-alive>
      </router-view>
    </div>
  </t-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import zhCN from 'tdesign-vue-next/es/locale/zh_CN'

const router = useRouter()

const keepAliveRouteNames = computed(() =>
  router
    .getRoutes()
    .filter(route => route.meta?.isKeepAlive && typeof route.name === 'string')
    .map(route => String(route.name)),
)
</script>

<style>
/* 子应用根容器样式，避免污染主应用全局 */
.qm-app {
  /* TDesign 主题与主应用（Element 蓝系）对齐，嵌入时视觉更连贯 */
  --td-brand-color: #2563eb;
  --td-brand-color-hover: #1d4ed8;
  --td-brand-color-active: #1e40af;
  --td-brand-color-focus: #dbeafe;
  --td-brand-color-light: #eff6ff;
  --td-text-color-link: #2563eb;

  /* 现代白色系配色 */
  --bg-light: #ffffff;
  --bg-secondary: #f8fafc;
  --card-bg: #ffffff;
  --primary-accent: #3b82f6;
  --accent-gradient: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  --text-main: #1e293b;
  --text-dim: #64748b;
  --border-glass: rgba(0, 0, 0, 0.08);
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  box-sizing: border-box;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  color: var(--text-main);
  min-height: 100vh;
  width: 100%;
}

.qm-app *,
.qm-app *::before,
.qm-app *::after {
  box-sizing: border-box;
}

.qm-app :where(h1, h2, h3, h4, h5, h6, p) {
  margin: 0;
}

/* Toast 提示 */
.qm-app .toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 12px 24px;
  border-radius: 12px;
  color: white;
  font-weight: 500;
  z-index: 1000;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
  animation: toastIn 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
}

@keyframes toastIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  70% {
    transform: scale(2.5);
    opacity: 0;
  }
  100% {
    opacity: 0;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .qm-app .modules-grid {
    grid-template-columns: 1fr;
  }

  .qm-app header {
    padding: 0 1rem;
  }
}

/* 嵌入模式样式 - 仅作用于子应用容器，避免影响宿主框架 */
body.embedded-mode .qm-app .sidebar,
body.embedded-mode .qm-app .main-nav {
  display: none !important;
}

body.embedded-mode .qm-app .main-content {
  margin-left: 0 !important;
  margin-top: 0 !important;
  padding: 1rem !important;
  height: 100vh !important;
}

body.embedded-mode .qm-app {
  background: #ffffff !important;
}
</style>
