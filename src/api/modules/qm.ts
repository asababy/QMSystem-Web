import { $get, $post } from '../utils/request'
import type {
  QualityReportParams,
  QualityReportDetailCountsRequest,
  QualityReportBatchRequest,
  QualityReportPreviewPdfRequest,
  QualityReportDownloadRequest,
  QualityReportTransmitLmeRequest,
  LmeReportParams
} from '../types/qm.types'

/**
 * QM相关API模块
 * 按中国企业规范：POST为主，GET辅助
 */
export const qmApi = {
  /**
   * 获取质量报告
   */
  getQualityReport: (params?: QualityReportParams) =>
    $get('qm/quality-report', params),

  /**
   * 获取质量报告详情统计
   */
  getQualityReportDetailCounts: (data: QualityReportDetailCountsRequest) =>
    $post('qm/quality-report/detail-counts', data),

  /**
   * 批量获取质量报告详情
   */
  getQualityReportBatchDetails: (data: QualityReportBatchRequest) =>
    $post('qm/quality-report/details/batch', data),

  /**
   * 预览质量报告PDF
   */
  previewQualityReportPdf: (data: QualityReportPreviewPdfRequest) =>
    $post('qm/quality-report/preview-pdf', data),

  /**
   * 下载质量报告
   */
  downloadQualityReport: (data: QualityReportDownloadRequest) =>
    $post(`qm/quality-report/download-${data.type}`, data),

  /**
   * 传输LME质量报告
   */
  transmitQualityReportLme: (data: QualityReportTransmitLmeRequest) =>
    $post('qm/quality-report/transmit-lme', data),

  /**
   * 获取LME报告
   */
  getLmeReport: (params?: LmeReportParams) =>
    $get('qm/lme-report', params),

  /**
   * 获取模块列表
   */
  getModules: () =>
    $get('modules'),

  /**
   * 记录模块下载统计
   */
  recordModuleDownload: (moduleId: string) =>
    $post(`${moduleId}/download`)
}

/**
 * API元数据 - 用于注册到主应用
 * 从这里自动生成 registry
 */
export const qmApiMetadata = [
  {
    code: 'QM001',
    name: '质检报告查询',
    displayName: 'api.qm001.name',
    route: '/api/qm/quality-report',
    method: 'GET' as const,
    description: '查询质检报告列表，支持日期范围筛选'
  },
  {
    code: 'QM002',
    name: '质检报告明细行数',
    displayName: 'api.qm002.name',
    route: '/api/qm/quality-report/detail-counts',
    method: 'POST' as const,
    description: '批量获取订单明细行数'
  },
  {
    code: 'QM003',
    name: '质检报告批量明细',
    displayName: 'api.qm003.name',
    route: '/api/qm/quality-report/details/batch',
    method: 'POST' as const,
    description: '批量获取订单明细数据'
  },
  {
    code: 'QM004',
    name: '预览质检报告PDF',
    displayName: 'api.qm004.name',
    route: '/api/qm/quality-report/preview-pdf',
    method: 'POST' as const,
    description: '生成并预览质检报告PDF'
  },
  {
    code: 'QM005',
    name: '下载质检报告',
    displayName: 'api.qm005.name',
    route: '/api/qm/quality-report/download',
    method: 'POST' as const,
    description: '下载Excel或PDF格式的质检报告'
  },
  {
    code: 'QM006',
    name: '传输LME质检报告',
    displayName: 'api.qm006.name',
    route: '/api/qm/quality-report/transmit-lme',
    method: 'POST' as const,
    description: '将质检报告传输到LME系统'
  },
  {
    code: 'QM007',
    name: 'LME报告查询',
    displayName: 'api.qm007.name',
    route: '/api/qm/lme-report',
    method: 'GET' as const,
    description: '查询LME报告列表'
  },
  {
    code: 'QM008',
    name: '获取模块列表',
    displayName: 'api.qm008.name',
    route: '/api/modules',
    method: 'GET' as const,
    description: '获取可下载模块列表'
  },
  {
    code: 'QM009',
    name: '记录模块下载',
    displayName: 'api.qm009.name',
    route: '/api/modules/download',
    method: 'POST' as const,
    description: '记录模块下载日志'
  }
]

