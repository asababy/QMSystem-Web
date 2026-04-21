<template>
  <div class="home-nav-buttons">
    <t-button theme="primary" size="small" variant="base" @click="goHome">
      {{ t('common.home') }}
    </t-button>
    <t-button theme="default" size="small" variant="outline" @click="goMainHome">
      {{ t('common.mainHome') }}
    </t-button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()

const HOME_PATH = '/quality/qmshome'
const MAIN_HOME_PATH = '/index'

function goHome() {
  const bridge = (window as any).qmBridge

  if (bridge && typeof bridge.navigateHome === 'function') {
    bridge.navigateHome()
    return
  }

  if (bridge && typeof bridge.navigate === 'function') {
    bridge.navigate(HOME_PATH)
    return
  }

  // 微前端场景兜底：直接同步到主应用 hash
  if ((window as any).__POWERED_BY_QIANKUN__) {
    const nextHash = `#/qm${HOME_PATH}`
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash
      return
    }
  }

  router.push(HOME_PATH)
}

function goMainHome() {
  const bridge = (window as any).qmBridge

  if (bridge && typeof bridge.navigate === 'function') {
    bridge.navigate(MAIN_HOME_PATH)
    return
  }

  if ((window as any).__POWERED_BY_QIANKUN__) {
    const nextHash = `#${MAIN_HOME_PATH}`
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash
      return
    }
  }

  window.location.href = MAIN_HOME_PATH
}
</script>

<style scoped>
.home-nav-buttons {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
</style>
