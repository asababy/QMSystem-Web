/**
 * QMSystem-UI 业务子应用多语言 Bridge 适配器
 * 
 * 特性：
 * 1. 零外部 npm 依赖（无需安装 @jovue/ui）
 * 2. 在微前端 (Wujie) 环境下：优先使用主应用 (JoSystem-WEB) 桥接透传的高性能多语言引擎
 * 3. 在独立运行环境下：内置 10 行轻量原生解析函数自动兜底
 */

export interface LanguageConfig {
  code: string;
  label: string;
  flag?: string;
  placeholder?: string;
}

/**
 * 默认基础语言列表
 */
export const DEFAULT_LANGUAGES: LanguageConfig[] = [
  { code: 'zh-CN', label: '中文', flag: '🇨🇳' },
  { code: 'en-US', label: 'English', flag: '🇺🇸' },
  { code: 'id-ID', label: 'Indonesia', flag: '🇮🇩' },
];

/**
 * 获取当前系统激活的语言列表
 * 优先读取主应用透传的 supportedLanguages，若无则使用默认基线
 */
export function getSupportedLanguages(): LanguageConfig[] {
  const wujieProps = (window as any).$wujie?.props;
  if (wujieProps?.supportedLanguages && Array.isArray(wujieProps.supportedLanguages)) {
    return wujieProps.supportedLanguages;
  }
  return DEFAULT_LANGUAGES;
}

/**
 * 获取当前界面语言
 */
export function getCurrentLang(): string {
  const wujieProps = (window as any).$wujie?.props;
  if (wujieProps?.getLocale && typeof wujieProps.getLocale === 'function') {
    return wujieProps.getLocale();
  }
  if (wujieProps?.locale) {
    return wujieProps.locale;
  }
  return localStorage.getItem('lang') || 'zh-CN';
}

/**
 * 原生轻量多语言 JSON 解析函数（独立运行兜底）
 * 前端彻底去除读取后端模型上的 JSON，全部走前端自身的多语言字典。
 */
function fallbackGetLocalizedText(rawJson?: string): string {
  if (!rawJson) return '';
  if (typeof rawJson !== 'string') return String(rawJson);

  const str = rawJson.trim();
  
  // QMSystem-UI 可能会作为独立应用，独立运行时直接返回 key 或原始文本。
  return str;
}

/**
 * 通用多语言文本提取函数 (Bridge 模式)
 * 
 * @param rawJson 后端返回的原始 JSON 字符串（如 {"zh-CN":"首页","en-US":"Home"}）
 * @returns 对应语言的纯文本字符串
 */
export function getLocalizedText(rawJson?: string): string {
  const wujieProps = (window as any).$wujie?.props;

  // 1. 微前端环境下：优先调用主应用注入的高性能 Bridge 函数
  if (wujieProps?.getLocalizedText && typeof wujieProps.getLocalizedText === 'function') {
    return wujieProps.getLocalizedText(rawJson);
  }

  // 2. 独立运行环境下：使用轻量原生纯函数解析
  return fallbackGetLocalizedText(rawJson);
}
