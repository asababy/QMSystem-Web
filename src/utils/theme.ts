import { ref, computed } from 'vue'

export type SupportedTheme = 'light' | 'dark' | 'purple'

const THEME_KEY = 'theme'
const DEFAULT_THEME: SupportedTheme = 'light'

const getInitialTheme = (): SupportedTheme => {
  if (typeof window === 'undefined') return DEFAULT_THEME
  const stored = localStorage.getItem(THEME_KEY)
  return (stored === 'light' || stored === 'dark' || stored === 'purple') ? stored : DEFAULT_THEME
}

// 全局响应式主题状态
export const currentTheme = ref<SupportedTheme>(getInitialTheme())

export const getCurrentTheme = (): SupportedTheme => currentTheme.value

/**
 * 设置全局主题并进行循环调用拦截
 */
export const setTheme = (theme?: string) => {
  const nextTheme: SupportedTheme = (theme === 'light' || theme === 'dark' || theme === 'purple') ? theme : DEFAULT_THEME
  
  if (typeof document !== 'undefined') {
    const root = document.documentElement
    if (root.getAttribute('data-theme') === nextTheme && currentTheme.value === nextTheme) {
      return nextTheme
    }
    root.setAttribute('data-theme', nextTheme)
  }
  
  currentTheme.value = nextTheme
  localStorage.setItem(THEME_KEY, nextTheme)
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('qm:theme-changed', {
      detail: { theme: nextTheme }
    }))
  }
  return nextTheme
}

// 初始化应用主题属性
setTheme(currentTheme.value)

/**
 * Vue 3 统一 Composable Hook
 */
export const useTheme = () => {
  const isDark = computed(() => currentTheme.value === 'dark')
  
  return {
    currentTheme,
    isDark,
    setTheme
  }
}
