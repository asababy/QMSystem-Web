// QM相关类型定义

export interface QualityReportParams {
  startDate?: string
  endDate?: string
  [key: string]: any
}

export interface QualityReportDetailCountsRequest {
  [key: string]: any
}

export interface QualityReportBatchRequest {
  orderIds: string[]
  [key: string]: any
}

export interface QualityReportPreviewPdfRequest {
  [key: string]: any
}

export interface QualityReportDownloadRequest {
  orderNumbers: string[]
  type: string
  templateName?: string
}

export interface QualityReportTransmitLmeRequest {
  orderNumbers: string[]
  templateName?: string
}

export interface LmeReportParams {
  startDate?: string
  endDate?: string
  [key: string]: any
}

export interface Module {
  id: string
  name: string
  [key: string]: any
}
