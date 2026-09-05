/**
 * 搜索字段配置
 */

import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { SearchFields } from '../types'

export const useSearchFields = () => {
  const { t } = useI18n()

  const searchFields = computed<SearchFields>(() => [
    {
      key: 'dateRange',
      label: t('qualityReport.search.businessDate'),
      type: 'date-range',
      startPlaceholder: '',
      endPlaceholder: '',
    },
    {
      key: 'orderNumber',
      label: t('qualityReport.search.orderNumber'),
      type: 'text',
      placeholder: '',
    },
    {
      key: 'grade',
      label: t('qualityReport.search.grade'),
      type: 'text',
      placeholder: '',
    },
    {
      key: 'lmeStatus',
      label: t('qualityReport.search.lmeStatus'),
      type: 'select',
      options: [
        { label: t('qualityReport.search.all'), value: '' },
        { label: t('qualityReport.search.transmitted'), value: 'Success' },
        { label: t('qualityReport.search.failed'), value: 'Failed' },
      ],
    },
  ])

  // 日期快捷键
  const dateShortcuts = computed(() => [
    t('qualityReport.shortcuts.currentMonth'),
    t('qualityReport.shortcuts.lastMonth'),
    t('qualityReport.shortcuts.currentQuarter'),
    t('qualityReport.shortcuts.lastQuarter'),
    t('qualityReport.shortcuts.today'),
    t('qualityReport.shortcuts.yesterday'),
  ])

  return {
    searchFields,
    dateShortcuts,
  }
}
