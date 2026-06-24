/**
 * LME 报告 API
 */

import { qmApi } from '@/api/modules'
import type { LmeReportQueryParams } from '../types'

export const lmeReportApi = {
  /**
   * 获取 LME 报告列表
   */
  getList: async (params: LmeReportQueryParams) => {
    const queryParams = new URLSearchParams()
    if (params.startDate) queryParams.append('startDate', params.startDate)
    if (params.endDate) queryParams.append('endDate', params.endDate)
    if (params.orderNumber) queryParams.append('orderNumber', params.orderNumber)
    if (params.grade) queryParams.append('grade', params.grade)
    if (params.lmeStatus) queryParams.append('lmeStatus', params.lmeStatus)

    return qmApi.getLmeReport(Object.fromEntries(queryParams))
  },
}
