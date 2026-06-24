/**
 * LME 报告类型定义
 */

import type { JoTableColumn } from '@/components/basic/table/JoTable.vue'
import type { SearchField } from '@/components/basic/search-panel/JoSearchPanel.vue'

/** LME 报告查询参数 */
export interface LmeReportQueryParams {
  startDate?: string
  endDate?: string
  orderNumber?: string
  grade?: string
  lmeStatus?: string
}

/** LME 报告数据项 */
export interface LmeReportItem {
  id: number
  orderNumber: string
  grade: string
  totalPackages: number
  totalWeight: number
  lmeStatus: string
  createTime: string
  syncTime: string
  syncUser: string
  lmeMessage: string
}

/** 表格列配置类型 */
export type TableColumns = JoTableColumn[]

/** 搜索字段配置类型 */
export type SearchFields = SearchField[]
