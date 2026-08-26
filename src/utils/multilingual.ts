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
 */
function fallbackGetLocalizedText(rawJson?: string, lang?: string): string {
  if (!rawJson) return '';
  if (typeof rawJson !== 'string') return String(rawJson);

  const trimmed = rawJson.trim();
  if (!trimmed.startsWith('{')) return rawJson;

  try {
    const parsed = JSON.parse(trimmed);
    const targetLang = (lang || getCurrentLang()).toLowerCase();

    // 1. 精确匹配（如 'zh-CN', 'en-US', 'id-ID'）
    for (const [k, v] of Object.entries(parsed)) {
      if (k.toLowerCase() === targetLang && typeof v === 'string') return v;
    }

    // 2. 短码匹配（如 'zh', 'en', 'id'）
    const shortCode = targetLang.split('-')[0];
    for (const [k, v] of Object.entries(parsed)) {
      if (k.toLowerCase().startsWith(shortCode) && typeof v === 'string') return v;
    }

    // 3. 常见默认语言兜底
    if (parsed['zh-CN']) return parsed['zh-CN'];
    if (parsed['en-US']) return parsed['en-US'];

    // 4. 首值兜底
    const firstVal = Object.values(parsed).find(v => typeof v === 'string' && v);
    return (firstVal as string) || rawJson;
  } catch {
    return rawJson;
  }
}

/**
 * 通用多语言文本提取函数 (Bridge 模式)
 * 
 * @param rawJson 后端返回的原始 JSON 字符串（如 {"zh-CN":"首页","en-US":"Home"}）
 * @param lang 可选指定语言，不传则自动取当前系统语言
 * @returns 对应语言的纯文本字符串
 */
export function getLocalizedText(rawJson?: string, lang?: string): string {
  const wujieProps = (window as any).$wujie?.props;

  // 1. 微前端环境下：优先调用主应用注入的高性能 Bridge 函数
  if (wujieProps?.getLocalizedText && typeof wujieProps.getLocalizedText === 'function') {
    return wujieProps.getLocalizedText(rawJson, lang);
  }

  // 2. 独立运行环境下：使用轻量原生纯函数解析
  return fallbackGetLocalizedText(rawJson, lang);
}
