/**
 * HTTP请求工具函数
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// 防抖机制
const notificationHistory = new Map<string, number>();
const NOTIFICATION_DEBOUNCE_MS = 5000; // 5秒内相同错误不重复弹窗

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')
const ensureLeadingSlash = (value: string) => (value.startsWith('/') ? value : `/${value}`)

function buildRequestUrl(baseUrl: string, path: string): string {
  return `${trimTrailingSlash(baseUrl)}${ensureLeadingSlash(path)}`
}

/**
 * 递归为对象/数组创建属性名不区分大小写（Case-Insensitive）的访问代理
 * 使得前端对 PascalCase 和 camelCase 都能自动识别命中
 */
export const makeCaseInsensitive = <T>(data: T): T => {
  if (data === null || typeof data !== 'object' || data instanceof Date || data instanceof RegExp || data instanceof Blob || data instanceof FormData) {
    return data
  }

  if (Array.isArray(data)) {
    return data.map(item => makeCaseInsensitive(item)) as unknown as T
  }

  const targetObj = data as Record<string, any>
  const keyMap = new Map<string, string>()

  for (const key of Object.keys(targetObj)) {
    keyMap.set(key.toLowerCase(), key)
    if (targetObj[key] !== null && typeof targetObj[key] === 'object') {
      targetObj[key] = makeCaseInsensitive(targetObj[key])
    }
  }

  return new Proxy(targetObj, {
    get(target, prop, receiver) {
      if (typeof prop === 'string' && prop !== 'then' && prop !== 'toJSON' && prop !== 'constructor' && prop !== 'prototype') {
        if (prop in target) {
          return Reflect.get(target, prop, receiver)
        }
        const lowerProp = prop.toLowerCase()
        const matchedKey = keyMap.get(lowerProp)
        if (matchedKey && matchedKey in target) {
          return Reflect.get(target, matchedKey, receiver)
        }
      }
      return Reflect.get(target, prop, receiver)
    },
    has(target, prop) {
      if (typeof prop === 'string') {
        if (prop in target) return true
        return keyMap.has(prop.toLowerCase())
      }
      return Reflect.has(target, prop)
    }
  }) as T
}

/**
 * 通用请求函数
 */
async function request<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
  const lang = localStorage.getItem('lang') || 'zh-CN'
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept-Language': lang,
    ...(options.headers as Record<string, string> || {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const config: RequestInit = {
    ...options,
    headers,
  }

  try {
    const requestUrl = buildRequestUrl(BASE_URL, url)
    const response = await fetch(requestUrl, config)

    if (!response.ok) {
      if (response.status === 401) {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken && !url.includes('/refresh-token')) {
          try {
            const refreshRes = await fetch(buildRequestUrl(BASE_URL, '/auth/refresh-token'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken })
            })
            if (refreshRes.ok) {
              const refreshJson = await refreshRes.json()
              const resData = refreshJson.data || refreshJson
              if (resData.token) {
                localStorage.setItem('accessToken', resData.token)
                if (resData.refreshToken) {
                  localStorage.setItem('refreshToken', resData.refreshToken)
                }
                headers['Authorization'] = `Bearer ${resData.token}`
                const retryRes = await fetch(requestUrl, { ...options, headers })
                if (retryRes.ok) {
                  const contentType = (retryRes.headers.get('content-type') || '').toLowerCase()
                  if (contentType.includes('application/json')) {
                    const jsonRes = await retryRes.json()
                    return makeCaseInsensitive(jsonRes) as T
                  }
                  return {} as T
                }
              }
            }
          } catch {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
          }
        }
      }
      const responseText = await response.text()
      const preview = responseText.slice(0, 200)
      console.error(`HTTP ${response.status} error from ${requestUrl}:`, preview)
      throw new Error(`HTTP ${response.status}: ${preview}`)
    }

    const contentType = (response.headers.get('content-type') || '').toLowerCase()
    const contentDisposition = (response.headers.get('content-disposition') || '').toLowerCase()
    const normalizedUrl = ensureLeadingSlash(url).toLowerCase()

    const isJsonResponse = contentType.includes('application/json') || contentType.includes('+json')
    if (isJsonResponse) {
      const jsonRes = await response.json()
      if (jsonRes && typeof jsonRes === 'object' && 'code' in jsonRes) {
        const code = Number(jsonRes.code)
        if (code !== 200 && code !== 0) {
          throw new Error(jsonRes.message || `操作失败 (Code: ${code})`)
        }
      }
      return makeCaseInsensitive(jsonRes) as T
    }

    const isBinaryResponse =
      normalizedUrl.includes('/download') ||
      contentDisposition.includes('attachment') ||
      contentType.includes('application/octet-stream') ||
      contentType.includes('application/pdf') ||
      contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

    if (isBinaryResponse) {
      return await response.blob() as T
    }

    const responseText = await response.text()
    if (!responseText) {
      return {} as T
    }

    try {
      const parsedRes = JSON.parse(responseText)
      return makeCaseInsensitive(parsedRes) as T
    } catch {
      const preview = responseText.slice(0, 200)
      console.error(`Invalid JSON response from ${requestUrl}:`, preview)
      throw new Error(`服务返回了非JSON内容: ${preview}`)
    }
  } catch (error) {
    console.error('Request error:', error)
    
    // 简化错误提示：只在控制台输出，不弹窗
    // 防止服务器断开时重复弹窗
    const errorKey = error instanceof Error ? error.message : String(error)
    const now = Date.now()
    const lastNotificationTime = notificationHistory.get(errorKey)
    
    if (!lastNotificationTime || now - lastNotificationTime >= NOTIFICATION_DEBOUNCE_MS) {
      notificationHistory.set(errorKey, now)
      
      // 清理过期的记录
      for (const [key, time] of notificationHistory.entries()) {
        if (now - time > NOTIFICATION_DEBOUNCE_MS) {
          notificationHistory.delete(key)
        }
      }
      
      // 只在首次错误时提示
      console.warn('请求错误:', error)
    }
    
    throw error
  }
}

/**
 * POST请求
 */
export function $post<T = any>(url: string, data?: any): Promise<T> {
  return request<T>(url, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * GET请求
 */
export function $get<T = any>(url: string, params?: Record<string, any>): Promise<T> {
  const queryString = params
    ? `?${new URLSearchParams(params as any).toString()}`
    : ''
  return request<T>(`${url}${queryString}`, {
    method: 'GET',
  })
}

/**
 * PUT请求
 */
export function $put<T = any>(url: string, data?: any): Promise<T> {
  return request<T>(url, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * DELETE请求
 */
export function $delete<T = any>(url: string, data?: any): Promise<T> {
  return request<T>(url, {
    method: 'DELETE',
    body: data ? JSON.stringify(data) : undefined,
  })
}
