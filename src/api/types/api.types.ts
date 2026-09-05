/**
 * 全系统统一 5 段式标准 API 响应契约模型 (工业级零向下兼容标准)
 * 与后端 ApiControllerBase / ApiResponse<T> 100% 严密对齐
 */
export interface ApiResponse<T = any> {
  /** 业务状态码：200=成功，400=业务错误，401=未认证，403=无权限，500=系统异常 */
  code: number
  /** 业务成功布尔标识 */
  success: boolean
  /** 用户/操作员提示消息 */
  message: string
  /** 强类型业务载荷 */
  data: T
  /** UTC ISO-8601 时间戳 */
  timestamp: string
}

/**
 * 全系统通用分页响应模型
 */
export interface PageResult<T = any> {
  items: T[]
  total: number
  pageIndex?: number
  pageSize?: number
  totalPages?: number
  list?: T[]
}
