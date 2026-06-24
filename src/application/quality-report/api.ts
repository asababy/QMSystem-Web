/**
 * 质量报告 API
 */

import { qmApi } from '@/api/modules'
import type { QualityReportQueryParams, DetailCountResponse, BatchDetailResponse } from '../types'

export const qualityReportApi = {
  /**
   * 获取质量报告列表
   */
  getList: async (params: QualityReportQueryParams) => {
    const queryParams = new URLSearchParams()
    if (params.startDate) queryParams.append('startDate', params.startDate)
    if (params.endDate) queryParams.append('endDate', params.endDate)
    if (params.orderNumber) queryParams.append('orderNumber', params.orderNumber)
    if (params.grade) queryParams.append('grade', params.grade)
    if (params.lmeStatus) queryParams.append('lmeStatus', params.lmeStatus)

    return qmApi.getQualityReport(Object.fromEntries(queryParams))
  },

  /**
   * 获取明细行数
   */
  getDetailCounts: async (orderNumbers: string[]) => {
    return qmApi.getQualityReportDetailCounts(orderNumbers)
  },

  /**
   * 批量获取明细数据
   */
  getBatchDetails: async (orderNumbers: string[]) => {
    return qmApi.getQualityReportBatchDetails(orderNumbers)
  },

  /**
   * 下载文件
   */
  downloadFile: async (orderNumbers: string[], format: 'excel' | 'pdf') => {
    // TODO: 实现下载逻辑
    console.log('下载文件:', { orderNumbers, format })
  },

  /**
   * 传输到 LME
   */
  transmitToLme: async (orderNumbers: string[]) => {
    // TODO: 实现传输逻辑
    console.log('传输到 LME:', { orderNumbers })
  },

  /**
   * 打印报告
   */
  printReport: async (orderNumbers: string[]) => {
    // TODO: 实现打印逻辑
    console.log('打印报告:', { orderNumbers })
  },
}
