import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN'
import enUS from './en-US'

export const LANGUAGE_KEY = 'lang'
export const SUPPORTED_LANGUAGES = ['zh-CN', 'en-US'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

const messages = {
  'zh-CN': zhCN,
  'en-US': enUS,
}

export const normalizeLanguage = (lang?: string): SupportedLanguage => {
  if (!lang) return 'zh-CN'
  if (lang === 'zh' || lang.toLowerCase().startsWith('zh')) return 'zh-CN'
  if (lang === 'en' || lang.toLowerCase().startsWith('en')) return 'en-US'
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
  i18n.global.locale.value = nextLang
  localStorage.setItem(LANGUAGE_KEY, nextLang)
  document.documentElement.setAttribute('lang', nextLang)
  return nextLang
}

setLanguage(getCurrentLanguage())

export default i18n

