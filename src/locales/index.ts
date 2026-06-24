import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN'
import enUS from './en-US'
import idID from './id-ID'

export const LANGUAGE_KEY = 'lang'
export const SUPPORTED_LANGUAGES = ['zh-CN', 'en-US', 'id-ID'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

const messages = {
  'zh-CN': zhCN,
  'en-US': enUS,
  'id-ID': idID,
}

export const normalizeLanguage = (lang?: string): SupportedLanguage => {
  if (!lang) return 'zh-CN'
  if (lang === 'zh' || lang.toLowerCase().startsWith('zh')) return 'zh-CN'
  if (lang === 'en' || lang.toLowerCase().startsWith('en')) return 'en-US'
  if (lang === 'id' || lang.toLowerCase().startsWith('id')) return 'id-ID'
  return 'zh-CN'
}

export const getCurrentLanguage = (): SupportedLanguage => {
  const fromStorage = localStorage.getItem(LANGUAGE_KEY)
  if (fromStorage) {
    return normalizeLanguage(fromStorage)
  }
  return normalizeLanguage(navigator.language)
}

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: getCurrentLanguage(),
  fallbackLocale: 'zh-CN',
  messages,
})

export const setLanguage = (lang?: string) => {
  const nextLang = normalizeLanguage(lang)
  
  // 避免重复触发事件导致无限循环卡死
  if (i18n.global.locale.value === nextLang && document.documentElement.getAttribute('lang') === nextLang) {
    return nextLang
  }
  
  i18n.global.locale.value = nextLang
  localStorage.setItem(LANGUAGE_KEY, nextLang)
  document.documentElement.setAttribute('lang', nextLang)
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('qm:lang-changed', {
      detail: { lang: nextLang }
    }))
  }
  return nextLang
}

setLanguage(getCurrentLanguage())

export default i18n

