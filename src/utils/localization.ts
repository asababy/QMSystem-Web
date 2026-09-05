/**
 * 企业级多语言文本解析工具 (支持 mtext 业务数据 JSON 与国际化文本)
 */

export function getCurrentLanguage(): string {
  try {
    const storedLang = localStorage.getItem('language') || localStorage.getItem('locale') || localStorage.getItem('lang');
    if (storedLang) {
      const lower = storedLang.toLowerCase();
      if (lower.includes('en')) return 'en-US';
      if (lower.includes('id')) return 'id-ID';
      if (lower.includes('zh')) return 'zh-CN';
      return storedLang;
    }
  } catch {
    // 忽略异常
  }
  return 'zh-CN';
}

/**
 * 解析业务数据中的多语言文本 (如 mtext)
 */
export function getLocalizedText(
  raw: string | Record<string, any> | undefined | null,
  explicitLang?: string
): string {
  if (!raw) return '';
  const currentLang = explicitLang || getCurrentLanguage() || 'zh-CN';

  // 1. 如果是对象或 JSON 字符串 (mtext 业务数据)
  let data = raw;
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        data = JSON.parse(trimmed);
      } catch {
        data = raw;
      }
    }
  }

  if (typeof data === 'object' && data !== null) {
    if (data[currentLang] !== undefined) return String(data[currentLang]).trim();
    const shortLang = currentLang.split('-')[0];
    if (data[shortLang] !== undefined) return String(data[shortLang]).trim();
    for (const key of Object.keys(data)) {
      if (key.toLowerCase().startsWith(shortLang.toLowerCase())) {
        return String(data[key]).trim();
      }
    }
    if (data['zh-CN'] !== undefined) return String(data['zh-CN']).trim();
    if (data['en-US'] !== undefined) return String(data['en-US']).trim();
    if (data['id-ID'] !== undefined) return String(data['id-ID']).trim();
    const firstVal = Object.values(data)[0];
    return firstVal != null ? String(firstVal).trim() : '';
  }

  return String(raw).trim();
}
