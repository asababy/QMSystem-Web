import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/modules'
import type { LoginRequest } from '@/api/types/auth.types'

export interface User {
  id: string
  username: string
  realName?: string
  department?: string
  role?: string
}

// JWT Token 解析函数
const parseJwtToken = (token: string): User | null => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    
    const payload = JSON.parse(jsonPayload)
    return {
      id: payload.sub || payload.nameid,
      username: payload.username || payload.preferred_username,
      realName: payload.realName || payload.name,
      department: payload.dept,
      role: payload.roles || payload.role
    }
  } catch (error) {
    console.error('JWT parse error:', error)
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const requiresAuthenticated = ref(false)
  const loading = ref(false)

  // 检查认证状态
  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      try {
        // 验证 token 有效性
        const response = await authApi.verifyToken()
        
        if (response.success) {
          // 解析 token 获取用户信息
          user.value = parseJwtToken(token)
          requiresAuthenticated.value = true
        } else {
          localStorage.removeItem('accessToken')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        localStorage.removeItem('accessToken')
      }
    }
  }

  // 登录 - 使用 SSO 两步走流程
  const login = async (credentials: { Username: string; Password: string }) => {
    loading.value = true
    try {
      // 第一步：获取 auth code
      const codeResponse = await authApi.getSsoCode({
        username: credentials.Username,
        password: credentials.Password
      })
      
      if (!codeResponse.success) {
        return { success: false, message: codeResponse.message || '认证失败' }
      }

      // 第二步：用 code 换取 JWT token
      const tokenResponse = await authApi.exchangeToken({
        code: codeResponse.data.code
      })

      if (tokenResponse.success) {
        // 保存 JWT token
        localStorage.setItem('accessToken', tokenResponse.data.token)
        
        // 解析用户信息
        const userInfo = parseJwtToken(tokenResponse.data.token)
        user.value = userInfo
        requiresAuthenticated.value = true
        
        return { success: true }
      } else {
        return { success: false, message: tokenResponse.message || 'Token 交换失败' }
      }
    } catch (error) {
      console.error('Login failed:', error)
      return { success: false, message: '登录失败，请稍后重试' }
    } finally {
      loading.value = false
    }
  }

  // 登出
  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      localStorage.removeItem('accessToken')
      user.value = null
      requiresAuthenticated.value = false
    }
  }

  return {
    user,
    requiresAuthenticated,
    loading,
    username: computed(() => user.value?.username || ''),
    checkAuth,
    login,
    logout
  }
})
