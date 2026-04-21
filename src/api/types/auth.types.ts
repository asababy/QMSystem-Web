// 认证相关类型定义

export interface LoginRequest {
  username: string
  password: string
}

export interface SsoCodeResponse {
  code: string
  message?: string
}

export interface ExchangeTokenRequest {
  code: string
}

export interface TokenResponse {
  token: string
  user?: {
    id: number
    username: string
    realName?: string
  }
}

export interface AuthResponse {
  code: number
  message: string
  data: TokenResponse
  success: boolean
}
