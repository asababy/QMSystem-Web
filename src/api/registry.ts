// API 注册表 - 用于暴露给主应用管理
// API元数据从 modules/qm.ts 自动生成，确保单一数据源

export interface ApiEndpointInfo {
  code: string
  name: string
  displayName?: string
  route: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  description?: string
  module?: string
}

export interface ApiRegistry {
  module: string
  name: string
  apis: ApiEndpointInfo[]
}

import { qmApiMetadata } from './modules/qm'

// QMSystem API 注册表 - 从 modules/qm.ts 引入
export const apiRegistry: ApiRegistry = {
  module: 'QMSystem',
  name: '质量管理系统',
  apis: qmApiMetadata
}

// 导出获取API列表的函数
export const getApiList = (): Array<ApiEndpointInfo & { module: string }> => {
  return apiRegistry.apis.map(api => ({
    ...api,
    module: api.module || apiRegistry.module
  }))
}
