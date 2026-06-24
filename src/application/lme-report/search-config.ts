/**
 * 搜索字段配置
 */

import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { SearchFields } from './types'

export const useSearchFields = () => {
  const { t } = useI18n()

  const searchFields = computed<SearchFields>(() => [
    {
      key: 'dateRange',
      label: t('lmeReport.search.recordTime'),
      type: 'date-range',
      startPlaceholder: t('lmeReport.search.startDate'),
      endPlaceholder: t('lmeReport.search.endDate'),
    },
    {
      key: 'orderNumber',
      label: t('lmeReport.search.orderNumber'),
      type: 'text',
      placeholder: t('lmeReport.search.supportsFuzzy'),
    },
    {
      key: 'grade',
      label: t('lmeReport.search.grade'),
      type: 'text',
      placeholder: t('lmeReport.search.supportsFuzzy'),
    },
    {
      key: 'lmeStatus',
      label: t('lmeReport.search.lmeStatus'),
      type: 'select',
      options: [
        { label: t('lmeReport.search.all'), value: '' },
        { label: t('lmeReport.search.transmitted'), value: 'Success' },
        { label: t('lmeReport.search.failed'), value: 'Failed' },
      ],
    },
  ])

  // 日期快捷键
  const dateShortcuts = computed(() => [
    String(t('lmeReport.shortcuts.currentMonth')),
    String(t('lmeReport.shortcuts.lastMonth')),
    String(t('lmeReport.shortcuts.currentQuarter')),
    String(t('lmeReport.shortcuts.lastQuarter')),
    String(t('lmeReport.shortcuts.today')),
    String(t('lmeReport.shortcuts.yesterday')),
  ])

  return {
    searchFields,
    dateShortcuts,
  }
}
