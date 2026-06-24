/**
 * 表格列配置
 */

import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { TableColumns } from '../types'

export const useTableColumns = () => {
  const { t } = useI18n()

  const formatDateTime = (val: string | Date) => {
    if (!val) return '-'
    const date = new Date(val)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // 主表格列配置
  const tableColumns = computed<TableColumns>(() => [
    {
      key: 'orderNumber',
      title: t('qualityReport.table.orderNumber'),
      sortable: true,
      filterable: true,
      filterPlaceholder: t('qualityReport.table.searchOrderNumber'),
    },
    {
      key: 'grade',
      title: t('qualityReport.table.grade'),
      sortable: true,
      filterable: true,
      filterPlaceholder: t('qualityReport.table.searchGrade'),
    },
    {
      key: 'totalPackages',
      title: t('qualityReport.table.totalPackages'),
      sortable: true,
      filterable: true,
      filterPlaceholder: t('qualityReport.table.searchTotalPackages'),
    },
    {
      key: 'totalWeight',
      title: t('qualityReport.table.totalWeight'),
      sortable: true,
      filterable: true,
      filterPlaceholder: t('qualityReport.table.searchTotalWeight'),
    },
    {
      key: 'bizTime',
      title: t('qualityReport.table.createTime'),
      sortable: true,
      filterable: true,
      filterPlaceholder: t('qualityReport.table.searchCreateTime'),
      formatter: (val) => formatDateTime(val),
    },
    {
      key: 'lmeStatus',
      title: t('qualityReport.table.lmeStatus'),
      sortable: true,
      filterable: true,
      filterPlaceholder: t('qualityReport.table.searchStatus'),
    },
  ])

  // 明细表格列配置
  const detailTableColumns = computed<TableColumns>(() => [
    {
      key: 'orderNumber',
      title: t('qualityReport.table.orderNumber'),
      sortable: true,
      filterable: true,
      filterPlaceholder: t('qualityReport.table.searchOrderNumber'),
    },
    {
      key: 'barcode',
      title: t('qualityReport.table.barcode'),
      sortable: true,
      filterable: true,
      filterPlaceholder: t('qualityReport.table.searchBarcode'),
    },
    {
      key: 'batchCode',
      title: t('qualityReport.table.batchCode'),
      sortable: true,
      filterable: true,
      filterPlaceholder: t('qualityReport.table.searchBatchCode'),
    },
    {
      key: 'baleNumber',
      title: t('qualityReport.table.baleNumber'),
      sortable: true,
      filterable: true,
      filterPlaceholder: t('qualityReport.table.searchBaleNumber'),
    },
    {
      key: 'weight',
      title: t('qualityReport.table.weight'),
      sortable: true,
      filterable: true,
      filterPlaceholder: t('qualityReport.table.searchWeight'),
    },
    {
      key: 'qmGrade',
      title: t('qualityReport.table.qmGrade'),
      sortable: true,
      filterable: true,
      filterPlaceholder: t('qualityReport.table.searchQmGrade'),
    },
    {
      key: 'qmBatchCode',
      title: t('qualityReport.table.qmBatchCode'),
      sortable: true,
      filterable: true,
      filterPlaceholder: t('qualityReport.table.searchQmBatchCode'),
    },
    {
      key: 'si',
      title: 'Si',
      sortable: true,
      filterable: true,
      filterPlaceholder: t('qualityReport.table.searchElement', { name: 'Si' }),
    },
    {
      key: 'fe',
      title: 'Fe',
      sortable: true,
      filterable: true,
      filterPlaceholder: t('qualityReport.table.searchElement', { name: 'Fe' }),
    },
    {
      key: 'zn',
      title: 'Zn',
      sortable: true,
      filterable: true,
      filterPlaceholder: t('qualityReport.table.searchElement', { name: 'Zn' }),
    },
    {
      key: 'ga',
      title: 'Ga',
      sortable: true,
      filterable: true,
      filterPlaceholder: t('qualityReport.table.searchElement', { name: 'Ga' }),
    },
    {
      key: 'v',
      title: 'V',
      sortable: true,
      filterable: true,
      filterPlaceholder: t('qualityReport.table.searchElement', { name: 'V' }),
    },
    {
      key: 'cr',
      title: 'Cr',
      sortable: true,
      filterable: true,
      filterPlaceholder: t('qualityReport.table.searchElement', { name: 'Cr' }),
    },
    {
      key: 'cu',
      title: 'Cu',
      sortable: true,
      filterable: true,
      filterPlaceholder: t('qualityReport.table.searchElement', { name: 'Cu' }),
    },
    {
      key: 'mg',
      title: 'Mg',
      sortable: true,
      filterable: true,
      filterPlaceholder: t('qualityReport.table.searchElement', { name: 'Mg' }),
    },
    {
      key: 'mn',
      title: 'Mn',
      sortable: true,
      filterable: true,
      filterPlaceholder: t('qualityReport.table.searchElement', { name: 'Mn' }),
    },
    {
      key: 'ni',
      title: 'Ni',
      sortable: true,
      filterable: true,
      filterPlaceholder: t('qualityReport.table.searchElement', { name: 'Ni' }),
    },
    {
      key: 'ti',
      title: 'Ti',
      sortable: true,
      filterable: true,
      filterPlaceholder: t('qualityReport.table.searchElement', { name: 'Ti' }),
    },
    {
      key: 'al',
      title: 'Al',
      sortable: true,
      filterable: true,
      filterPlaceholder: t('qualityReport.table.searchElement', { name: 'Al' }),
    },
    {
      key: 'otherS_total',
      title: t('qualityReport.table.otherS'),
      sortable: true,
      filterable: true,
      filterPlaceholder: t('qualityReport.table.searchOtherS'),
    },
  ])

  return {
    tableColumns,
    detailTableColumns,
    formatDateTime,
  }
}
