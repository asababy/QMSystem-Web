/**
 * 质量报告类型定义
 */

import type { JoTableColumn } from '@/components/basic/table/JoTable.vue'
import type { SearchField } from '@/components/basic/search-panel/JoSearchPanel.vue'

/** 质量报告查询参数 */
export interface QualityReportQueryParams {
  startDate?: string
  endDate?: string
  orderNumber?: string
  grade?: string
  lmeStatus?: string
}

/** 质量报告主表数据 */
export interface QualityReportItem {
  orderNumber: string
  grade: string
  totalPackages: number
  totalWeight: number
  bizTime: string
  lmeStatus: string
}

/** 质量报告明细数据 */
export interface QualityReportDetailItem {
  orderNumber: string
  barcode: string
  batchCode: string
  baleNumber: string
  weight: number
  qmGrade: string
  qmBatchCode: string
  si?: number
  fe?: number
  zn?: number
  ga?: number
  v?: number
  cr?: number
  cu?: number
  mg?: number
  mn?: number
  ni?: number
  ti?: number
  al?: number
  otherS_total?: number
}

/** 质量报告明细行数响应 */
export interface DetailCountResponse {
  [orderNumber: string]: number
}

/** 批量明细响应 */
export interface BatchDetailResponse {
  details: QualityReportDetailItem[]
}

/** 表格列配置类型 */
export type TableColumns = JoTableColumn[]

/** 搜索字段配置类型 */
export type SearchFields = SearchField[]
