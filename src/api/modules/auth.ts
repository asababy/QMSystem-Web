import { $post } from '../utils/request'
import type { LoginRequest, ExchangeTokenRequest, AuthResponse } from '../types/auth.types'

/**
 * 认证相关API模块
 * 按中国企业规范：POST为主，GET辅助
 */
export const authApi = {
  /**
   * SSO登录 - 获取auth code
   */
  getSsoCode: (data: LoginRequest) => 
    $post('login/sso', data),

  /**
   * 用code换取JWT token
   */
  exchangeToken: (data: ExchangeTokenRequest) => 
    $post('login/exchange-token', data),

  /**
   * 验证token有效性
   */
  verifyToken: () => 
    $post('auth'),

  /**
   * 登出
   */
  logout: () => 
    $post('logout')
}
