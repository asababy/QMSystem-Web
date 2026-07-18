import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

export const useBillList = () => {
  const { t, locale } = useI18n()

  const formatDateTime = (val: string | Date | undefined) => {
    if (!val) return '-'
    const date = new Date(val)
    if (locale.value === 'en-US') {
      return date.toLocaleString('en-US')
    }
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const getStatusClass = (status: string) => {
    if (status === '已传输' || status === '成功' || status === 'Success') return 'text-success'
    if (status === '传输失败' || status === '失败' || status === 'Failed') return 'text-error'
    return ''
  }

  // 通用的日期快捷键翻译 key，如果不合适，业务模块可自行覆盖
  const dateShortcuts = computed(() => [
    String(t('common.shortcuts.currentMonth', '本月')),
    String(t('common.shortcuts.lastMonth', '上月')),
    String(t('common.shortcuts.currentQuarter', '本季度')),
    String(t('common.shortcuts.lastQuarter', '上季度')),
    String(t('common.shortcuts.today', '今天')),
    String(t('common.shortcuts.yesterday', '昨天')),
  ])

  // 通用的快捷键日期计算逻辑，直接返回 [开始日期, 结束日期]
  const calculateDateRangeByShortcut = (shortcut: string, shortcutsList: string[]) => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    let firstDay: Date, lastDay: Date

    // 以防使用自定义或带有 fallback 的国际化，尝试用索引判断或用具体内容判断。
    // 这里采用跟原业务相同的顺序/名字判断
    if (shortcut === shortcutsList[4] || shortcut === '今天' || shortcut.includes('today')) {
      firstDay = new Date(now)
      lastDay = new Date(now)
    } else if (shortcut === shortcutsList[5] || shortcut === '昨天' || shortcut.includes('yesterday')) {
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      firstDay = yesterday
      lastDay = yesterday
    } else if (shortcut === shortcutsList[0] || shortcut === '本月' || shortcut.includes('currentMonth')) {
      firstDay = new Date(currentYear, currentMonth, 1)
      lastDay = new Date(currentYear, currentMonth + 1, 0)
    } else if (shortcut === shortcutsList[1] || shortcut === '上月' || shortcut.includes('lastMonth')) {
      firstDay = new Date(currentYear, currentMonth - 1, 1)
      lastDay = new Date(currentYear, currentMonth, 0)
    } else if (shortcut === shortcutsList[2] || shortcut === '本季度' || shortcut.includes('currentQuarter')) {
      const currentQuarter = Math.floor(currentMonth / 3)
      firstDay = new Date(currentYear, currentQuarter * 3, 1)
      lastDay = new Date(currentYear, (currentQuarter + 1) * 3, 0)
    } else if (shortcut === shortcutsList[3] || shortcut === '上季度' || shortcut.includes('lastQuarter')) {
      const lastQuarter = Math.floor(currentMonth / 3) - 1
      firstDay = new Date(currentYear, lastQuarter * 3, 1)
      lastDay = new Date(currentYear, (lastQuarter + 1) * 3, 0)
    } else {
      return null
    }

    return {
      startDate: formatDate(firstDay),
      endDate: formatDate(lastDay),
    }
  }

  // 默认月初和月末
  const getDefaultDateRange = () => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    return {
      startDate: formatDate(firstDay),
      endDate: formatDate(lastDay),
      endDateNextDay: formatDate(new Date(lastDay.getTime() + 24 * 60 * 60 * 1000))
    }
  }

  return {
    formatDateTime,
    formatDate,
    getStatusClass,
    dateShortcuts,
    calculateDateRangeByShortcut,
    getDefaultDateRange
  }
}
