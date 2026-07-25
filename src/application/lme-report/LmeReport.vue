<template>
  <div class="page">
    <GlassCard>
      <div class="title-row">
        <div>
          <h1>{{ t('lmeReport.title') }}</h1>
          <div class="subtitle">{{ t('lmeReport.subtitle') }}</div>
        </div>
        <div class="title-actions">
          <HomeNavButton />
          <div :class="['status-badge', hasError ? 'status-error' : 'status-ok']">
            {{ statusText }}
          </div>
        </div>
      </div>

      <div class="main-content-row">
        <div class="filter-section">
          <JoSearchPanel ref="searchPanelRef" :fields="searchFields" :search-text="t('common.query')"
            :reset-text="t('common.reset')" v-model="searchValues" :collapsible="true" :collapsed="false"
            :date-shortcuts="dateShortcuts" store-key="lme-report-presets"
            @search="handleSearch" @reset="handleReset" @shortcut-click="handleDateShortcut" />
        </div>
      </div>

      <div class="status-bar">
        <div>{{ message }}</div>
        <div>{{ t('common.allRecords', { count: rows.length }) }}</div>
      </div>

      <JoTable ref="tableRef" :data="rows" :columns="tableColumns" row-key="id" :selectable="false" :filterable="true"
        max-height="600px" @sort-change="onTableSortChange">
        <template #cell-createTime="{ value }">
          {{ formatDateTime(value) }}
        </template>
        <template #cell-syncTime="{ value }">
          {{ formatDateTime(value) }}
        </template>
        <template #cell-grade="{ value }">
          {{ value || '-' }}
        </template>
        <template #cell-lmeStatus="{ value }">
          <span :class="getStatusClass(value)">{{ value || '-' }}</span>
        </template>
      </JoTable>
    </GlassCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import GlassCard from '@/components/glass/GlassCard.vue'
import JoTable from '@/components/basic/table/JoTable.vue'
import JoSearchPanel from '@/components/basic/search-panel/JoSearchPanel.vue'
import HomeNavButton from '@/components/layout/HomeNavButton.vue'
import { lmeReportApi } from './api'
import { useTableColumns } from './table-config'
import { useSearchFields } from './search-config'
import type { LmeReportItem } from './types'

const { t } = useI18n()
const { tableColumns, formatDateTime, getStatusClass } = useTableColumns()
const { searchFields, dateShortcuts } = useSearchFields()

const now = new Date()
const currentYear = now.getFullYear()
const currentMonth = now.getMonth()
const firstDay = new Date(currentYear, currentMonth, 1)
const lastDay = new Date(currentYear, currentMonth + 1, 0)

const formatDate = (date: Date) => {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

const startDate = ref(formatDate(firstDay))
const endDateForDisplay = ref(formatDate(lastDay))
const searchValues = ref<Record<string, any>>({
  dateRange_start: startDate.value,
  dateRange_end: endDateForDisplay.value,
  lmeStatus: 'Failed',
})
const endDate = ref(formatDate(new Date(lastDay.getTime() + 24 * 60 * 60 * 1000)))
const orderNumber = ref('')
const grade = ref('')
const lmeStatus = ref('')
const rows = ref<LmeReportItem[]>([])
const loading = ref(false)
const statusText = ref(String(t('common.ready')))
const hasError = ref(false)
const message = ref(String(t('lmeReport.defaultQuery', { start: startDate.value, end: endDateForDisplay.value })))
const searchPanelRef = ref<InstanceType<typeof JoSearchPanel>>()
const tableRef = ref<InstanceType<typeof JoTable>>()

function handleSearch(values: Record<string, any>) {
  if (values.dateRange_start) startDate.value = values.dateRange_start
  if (values.dateRange_end) {
    const displayDate = new Date(values.dateRange_end)
    const nextDay = new Date(displayDate.getTime() + 24 * 60 * 60 * 1000)
    endDate.value = formatDate(nextDay)
    endDateForDisplay.value = values.dateRange_end
  }
  orderNumber.value = values.orderNumber || ''
  grade.value = values.grade || ''
  lmeStatus.value = values.lmeStatus || ''
  fetchData(false)
}

function handleReset() {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  const firstDay = new Date(currentYear, currentMonth, 1)
  const lastDay = new Date(currentYear, currentMonth + 1, 0)

  startDate.value = formatDate(firstDay)
  endDateForDisplay.value = formatDate(lastDay)
  endDate.value = formatDate(new Date(lastDay.getTime() + 24 * 60 * 60 * 1000))
  orderNumber.value = ''
  grade.value = ''
  lmeStatus.value = ''

  tableRef.value?.reset()
  rows.value = []
  statusText.value = String(t('common.ready'))
  message.value = String(t('lmeReport.resetDone'))
}

function handleDateShortcut(shortcut: string) {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  let firstDay: Date, lastDay: Date

  switch (shortcut) {
    case t('lmeReport.shortcuts.today'):
      firstDay = new Date(now)
      lastDay = new Date(now)
      break
    case t('lmeReport.shortcuts.yesterday'):
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      firstDay = yesterday
      lastDay = yesterday
      break
    case t('lmeReport.shortcuts.currentMonth'):
      firstDay = new Date(currentYear, currentMonth, 1)
      lastDay = new Date(currentYear, currentMonth + 1, 0)
      break
    case t('lmeReport.shortcuts.lastMonth'):
      firstDay = new Date(currentYear, currentMonth - 1, 1)
      lastDay = new Date(currentYear, currentMonth, 0)
      break
    case t('lmeReport.shortcuts.currentQuarter'):
      const currentQuarter = Math.floor(currentMonth / 3)
      firstDay = new Date(currentYear, currentQuarter * 3, 1)
      lastDay = new Date(currentYear, (currentQuarter + 1) * 3, 0)
      break
    case t('lmeReport.shortcuts.lastQuarter'):
      const lastQuarter = Math.floor(currentMonth / 3) - 1
      firstDay = new Date(currentYear, lastQuarter * 3, 1)
      lastDay = new Date(currentYear, (lastQuarter + 1) * 3, 0)
      break
    default:
      return
  }

  const newValues = {
    ...searchValues.value,
    dateRange_start: formatDate(firstDay),
    dateRange_end: formatDate(lastDay),
  }
  searchPanelRef.value?.setValues(newValues)
  handleSearch(newValues)
}

async function fetchData(isInitial: boolean) {
  loading.value = true
  hasError.value = false
  statusText.value = String(t('common.querying'))

  const params = {
    startDate: startDate.value,
    endDate: endDate.value,
    orderNumber: orderNumber.value.trim(),
    grade: grade.value.trim(),
    lmeStatus: lmeStatus.value.trim(),
  }

  const searchInfo = []
  if (params.startDate && params.endDate) searchInfo.push(`时间范围：${params.startDate} ~ ${endDateForDisplay.value}`)
  if (params.orderNumber) searchInfo.push(`单号：${params.orderNumber}`)
  if (params.grade) searchInfo.push(`牌号：${params.grade}`)
  if (params.lmeStatus) searchInfo.push(`状态：${params.lmeStatus}`)

  message.value = searchInfo.length > 0
    ? String(t('lmeReport.queryConditions', { conditions: searchInfo.join('，') }))
    : String(t('lmeReport.queryAll'))

  try {
    const resp = await lmeReportApi.getList(params)

    if (!resp.success) {
      throw new Error(resp.message || '查询失败')
    }

    rows.value = resp.data || []
    statusText.value = String(t('common.queryDone'))
    hasError.value = false

    const recordCount = rows.value.length
    message.value = isInitial
      ? String(t('lmeReport.defaultQueryDone', { count: recordCount }))
      : String(t('lmeReport.queryDone', { count: recordCount }))
  } catch (error) {
    console.error('查询失败:', error)
    statusText.value = String(t('common.queryFailed'))
    hasError.value = true
    message.value = `查询失败: ${error instanceof Error ? error.message : String(error)}`
  } finally {
    loading.value = false
  }
}

function onTableSortChange(field: string, order: 'asc' | 'desc') {
  console.log(`排序: ${field} ${order}`)
}

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  const auto = params.get('auto') === '1' || params.get('autoQuery') === '1'

  handleSearch(searchValues.value)

  if (auto) {
    fetchData(true)
  } else {
    fetchData(true)
  }
})
</script>

<style scoped lang="scss">
.page {
  width: 100%;
  min-width: 0;
  min-height: 100%;
  padding: 24px;
  box-sizing: border-box;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h1 {
    font-size: var(--font-size-xl);
    font-weight: 600;
    color: var(--text-main);
    margin: 0;
  }

  .subtitle {
    font-size: var(--font-size-sm);
    color: var(--text-dim);
    margin-top: 4px;
  }
}

.title-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: var(--radius-xl);
  font-size: var(--font-size-xs);
  font-weight: 500;

  &.status-ok {
    background: var(--color-success-light);
    color: var(--color-success-dark);
  }

  &.status-error {
    background: var(--color-danger-light);
    color: var(--color-danger-dark);
  }
}

.main-content-row {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.date-shortcuts-header {
  display: flex;
  align-items: center;
  gap: 4px;
}

.shortcuts-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-dim, #9ca3af);
  margin-right: 4px;
}

.date-shortcuts-header :deep(.t-button) {
  font-weight: 500;
  color: var(--text-dim, #9ca3af);
}

.date-shortcuts-header :deep(.t-button:hover) {
  color: var(--color-primary, #ff7828);
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--text-dim);
}

.text-success {
  background: var(--color-success-light);
  color: var(--color-success-dark);
  padding: 2px 8px;
  border-radius: var(--radius-xl);
  font-size: var(--font-size-xs);
  font-weight: 500;
  display: inline-block;
}

.text-error {
  background: var(--color-danger-light);
  color: var(--color-danger-dark);
  padding: 2px 8px;
  border-radius: var(--radius-xl);
  font-size: var(--font-size-xs);
  font-weight: 500;
  display: inline-block;
}
</style>
