/**
 * HTTP请求工具函数
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')
const ensureLeadingSlash = (value: string) => (value.startsWith('/') ? value : `/${value}`)

function buildRequestUrl(baseUrl: string, path: string): string {
  return `${trimTrailingSlash(baseUrl)}${ensureLeadingSlash(path)}`
}

/**
 * 通用请求函数
 */
async function request<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token')
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
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
      return await response.json() as T
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
      return JSON.parse(responseText) as T
    } catch {
      const preview = responseText.slice(0, 200)
      console.error(`Invalid JSON response from ${requestUrl}:`, preview)
      throw new Error(`服务返回了非JSON内容: ${preview}`)
    }
  } catch (error) {
    console.error('Request error:', error)
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
