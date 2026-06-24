/**
 * 表格列配置
 */

import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { TableColumns } from './types'

export const useTableColumns = () => {
  const { t, locale } = useI18n()

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleString(locale.value === 'en-US' ? 'en-US' : 'zh-CN')
  }

  const getStatusClass = (status: string) => {
    if (status === '已传输' || status === '成功') return 'text-success'
    if (status === '传输失败' || status === '失败') return 'text-error'
    return ''
  }

  // 表格列配置
  const tableColumns = computed<TableColumns>(() => [
    {
      key: 'orderNumber',
      title: t('lmeReport.table.orderNumber'),
      sortable: true,
      filterable: true,
      filterPlaceholder: t('lmeReport.table.searchOrderNumber'),
      width: '140px',
    },
    {
      key: 'grade',
      title: t('lmeReport.table.grade'),
      sortable: true,
      filterable: true,
      filterPlaceholder: t('lmeReport.table.searchGrade'),
      width: '90px',
    },
    {
      key: 'totalPackages',
      title: t('lmeReport.table.totalPackages'),
      sortable: true,
      width: '90px',
    },
    {
      key: 'totalWeight',
      title: t('lmeReport.table.totalWeight'),
      sortable: true,
      width: '90px',
    },
    {
      key: 'lmeStatus',
      title: t('lmeReport.table.lmeStatus'),
      sortable: true,
      filterable: true,
      width: '100px',
    },
    {
      key: 'createTime',
      title: t('lmeReport.table.createTime'),
      sortable: true,
      width: '160px',
    },
    {
      key: 'syncTime',
      title: t('lmeReport.table.syncTime'),
      sortable: true,
      width: '160px',
    },
    {
      key: 'syncUser',
      title: t('lmeReport.table.syncUser'),
      sortable: true,
      filterable: true,
      width: '100px',
    },
    {
      key: 'lmeMessage',
      title: t('lmeReport.table.lmeMessage'),
      sortable: false,
      filterable: true,
      filterPlaceholder: t('common.search'),
    },
  ])

  return {
    tableColumns,
    formatDateTime,
    getStatusClass,
  }
}
