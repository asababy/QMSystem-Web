<template>
  <div class="page">
    <GlassCard>
      <div class="title-row">
        <div>
          <h1>{{ t('qualityReport.title') }}</h1>
          <div class="subtitle">{{ t('qualityReport.subtitle') }}</div>
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
            :date-shortcuts="dateShortcuts" store-key="quality-report-presets" @search="handleSearch"
            @reset="handleReset" @shortcut-click="handleDateShortcut" />
        </div>
      </div>

      <div class="status-bar">
        <div class="status-left">
          <span>{{ message }}</span>
          <span class="record-count-sep">|</span>
          <span class="record-count-text">{{ t('common.allRecords', { count: rows.length }) }}</span>
        </div>
        <div class="action-bar">
          <t-button class="action-preview" theme="primary" size="small" variant="base" :disabled="!canDownload"
            @click="streamingPreview">
            {{ t('qualityReport.preview') }}
          </t-button>
          <t-button theme="success" size="small" variant="base" :disabled="!canDownload" @click="downloadFile('excel')">
            {{ t('qualityReport.downloadExcel') }}
          </t-button>
          <t-button theme="success" size="small" variant="base" :disabled="!canDownload" @click="downloadFile('pdf')">
            {{ t('qualityReport.downloadPdf') }}
          </t-button>
          <t-button theme="warning" size="small" variant="base" :disabled="!canDownload" @click="transmitToLme">
            {{ t('qualityReport.transmitLme') }}
          </t-button>
          <t-button class="action-print" theme="primary" size="small" variant="base" :disabled="!canDownload"
            @click="printReport">
            {{ t('qualityReport.print') }}
          </t-button>
        </div>
      </div>

      <div v-if="lmeResponseText" class="api-result-panel">
        <div class="api-result-header">
          <span>{{ t('qualityReport.lmeResponse') }}</span>
          <t-button size="small" theme="default" variant="outline" @click="lmeResponseText = ''">
            {{ t('common.clear') }}
          </t-button>
        </div>
        <pre class="api-result-content">{{ lmeResponseText }}</pre>
      </div>

      <JoTable ref="tableRef" :data="rows" :columns="tableColumns" row-key="orderNumber" :selectable="true"
        v-model:selected-keys="selectedOrders" :filterable="true" :disabled-row="disabledRow" max-height="520px"
        @selection-change="onTableSelectionChange" @sort-change="onTableSortChange">
        <template #cell-bizTime="{ value }">
          {{ formatDateTime(value) }}
        </template>
        <template #cell-grade="{ value }">
          {{ value || '-' }}
        </template>
        <template #cell-lmeStatus="{ value }">
          {{ value || '-' }}
        </template>
      </JoTable>

      <!-- 选中订单明细区域 -->
      <div class="details-section" v-if="selectedOrders.length > 0">
        <div class="details-header">
          <h3 class="details-title">{{ t('qualityReport.selectedDetails') }}</h3>
          <t-button theme="primary" size="small" variant="base" :loading="loadingDetails" :disabled="loadingDetails"
            @click="toggleDetailsView">
            {{ loadingDetails ? t('common.loading') : (showDetails ? t('qualityReport.hideDetails') :
              t('qualityReport.showDetails')) }}
          </t-button>
        </div>

        <div class="status-bar">
          {{ t('qualityReport.selectedDetails') }}: {{ selectedOrders.length }} / {{ selectedOrderDetails.length }}
          <span v-if="selectedOrders.length > 1 && !sameGradeValidation">({{ t('qualityReport.gradeMismatch') }})</span>
        </div>

        <div v-if="loadingDetails" class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: (detailsProgress / detailsTotal) * 100 + '%' }"></div>
          </div>
          <div class="progress-text">
            {{ t('qualityReport.loadingDetails', { current: detailsProgress, total: detailsTotal }) }}
          </div>
        </div>

        <div class="grade-warning" v-if="selectedOrders.length > 1 && !sameGradeValidation">
          ⚠️ {{ t('qualityReport.gradeMismatch') }}
        </div>

        <div v-if="showDetails && selectedOrderDetails.length > 0" class="detail-table-wrapper">
          <JoTable ref="detailTableRef" :data="selectedOrderDetails" :columns="detailTableColumns" row-key="barcode"
            :selectable="false" :showIndex="true" :showFilters="true" max-height="400px" class="detail-jo-table" />
        </div>
      </div>
    </GlassCard>
  </div>

  <JoToast ref="toastRef" />
  <JoDialog ref="dialogRef" />
</template>

<script lang="ts">
export default {
  name: 'QualityReport',
}
</script>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import GlassCard from '@/components/glass/GlassCard.vue'
import JoTable from '@/components/basic/table/JoTable.vue'
import JoSearchPanel from '@/components/basic/search-panel/JoSearchPanel.vue'
import HomeNavButton from '@/components/layout/HomeNavButton.vue'
import JoToast from '@/components/basic/toast/JoToast.vue'
import JoDialog from '@/components/basic/dialog/JoDialog.vue'
import { qualityReportApi } from './api'
import { useTableColumns } from './table-config'
import { useSearchFields } from './search-config'
import type { QualityReportItem, QualityReportDetailItem } from './types'

const { t } = useI18n()
const { tableColumns, detailTableColumns, formatDateTime } = useTableColumns()
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
const searchValues = ref<Record<string, any>>({
  dateRange_start: startDate.value,
  dateRange_end: formatDate(lastDay),
})
const endDateForDisplay = ref(formatDate(lastDay))
const endDate = ref(formatDate(new Date(lastDay.getTime() + 24 * 60 * 60 * 1000)))
const orderNumber = ref('')
const grade = ref('')
const lmeStatus = ref('')
const rows = ref<QualityReportItem[]>([])
const loading = ref(false)
const isFiltering = ref(false)
const statusText = ref(String(t('common.ready')))
const hasError = ref(false)
const message = ref(String(t('qualityReport.defaultQuery', { start: startDate.value, end: endDateForDisplay.value })))
const selectedOrders = ref<string[]>([])
const allSelected = ref(false)
const activeDateRange = ref('')
const showDetails = ref(false)
const selectedOrderDetails = ref<QualityReportDetailItem[]>([])
const loadingDetails = ref(false)
const detailsProgress = ref(0)
const detailsTotal = ref(0)
const lmeResponseText = ref('')
const searchPanelRef = ref<InstanceType<typeof JoSearchPanel>>()
const toastRef = ref<InstanceType<typeof JoToast>>()
const dialogRef = ref<InstanceType<typeof JoDialog>>()
const detailTableRef = ref<InstanceType<typeof JoTable>>()
const tableRef = ref<InstanceType<typeof JoTable>>()

const disabledRow = (row: QualityReportItem) => {
  return row.lmeStatus === 'Success'
}

const canDownload = computed(() => {
  return selectedOrders.value.length > 0 && sameGradeValidation.value
})

const sameGradeValidation = computed(() => {
  if (selectedOrders.value.length <= 1) return true
  const selectedRows = rows.value.filter(row => selectedOrders.value.includes(row.orderNumber))
  const grades = [...new Set(selectedRows.map(row => row.grade).filter(grade => grade))]
  return grades.length <= 1
})

const toDayStart = (v: string | number | Date): Date => {
  if (v instanceof Date) {
    return new Date(v.getFullYear(), v.getMonth(), v.getDate())
  }
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v)) {
    const [y, m, d] = v.slice(0, 10).split('-').map(Number)
    return new Date(y, m - 1, d)
  }
  const x = new Date(v)
  return new Date(x.getFullYear(), x.getMonth(), x.getDate())
}

const validateDate = (dateStr: string) => {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) {
    return null
  }
  const formatted = formatDate(date)
  return formatted === dateStr ? dateStr : formatted
}

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

  resetSelectionState()
  tableRef.value?.reset()
  rows.value = []
  statusText.value = String(t('common.ready'))
  message.value = String(t('qualityReport.resetDone'))
}

function handleDateShortcut(shortcut: string) {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  let firstDay: Date, lastDay: Date

  switch (shortcut) {
    case t('qualityReport.shortcuts.today'):
      firstDay = new Date(now)
      lastDay = new Date(now)
      break
    case t('qualityReport.shortcuts.yesterday'):
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      firstDay = yesterday
      lastDay = yesterday
      break
    case t('qualityReport.shortcuts.currentMonth'):
      firstDay = new Date(currentYear, currentMonth, 1)
      lastDay = new Date(currentYear, currentMonth + 1, 0)
      break
    case t('qualityReport.shortcuts.lastMonth'):
      firstDay = new Date(currentYear, currentMonth - 1, 1)
      lastDay = new Date(currentYear, currentMonth, 0)
      break
    case t('qualityReport.shortcuts.currentQuarter'):
      const currentQuarter = Math.floor(currentMonth / 3)
      firstDay = new Date(currentYear, currentQuarter * 3, 1)
      lastDay = new Date(currentYear, (currentQuarter + 1) * 3, 0)
      break
    case t('qualityReport.shortcuts.lastQuarter'):
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
  isFiltering.value = true
  hasError.value = false
  statusText.value = String(t('common.querying'))
  resetSelectionState()
  lmeResponseText.value = ''

  const params = {
    startDate: startDate.value,
    endDate: endDate.value,
    orderNumber: orderNumber.value.trim(),
    grade: grade.value.trim(),
    lmeStatus: lmeStatus.value.trim(),
  }

  const searchInfo = []
  if (params.startDate && params.endDate) searchInfo.push(`时间范围：${params.startDate} ~ ${params.endDate}`)
  if (params.orderNumber) searchInfo.push(`单号：${params.orderNumber}`)
  if (params.grade) searchInfo.push(`牌号：${params.grade}`)
  if (params.lmeStatus) searchInfo.push(`LME状态：${params.lmeStatus}`)

  message.value = searchInfo.length > 0
    ? String(t('qualityReport.queryConditions', { conditions: searchInfo.join('，') }))
    : String(t('qualityReport.queryAll'))

  try {
    const resp = await qualityReportApi.getList(params)

    if (!resp.success) {
      throw new Error(resp.message || '查询失败')
    }

    rows.value = resp.data || []
    statusText.value = String(t('common.queryDone'))
    hasError.value = false
    resetSelectionState()

    message.value = isInitial
      ? `${t('common.queryDone')} (默认)`
      : t('common.queryDone')
  } catch (error) {
    console.error('查询失败:', error)
    statusText.value = String(t('common.queryFailed'))
    hasError.value = true
    message.value = `查询失败: ${error instanceof Error ? error.message : String(error)}`
  } finally {
    loading.value = false
    isFiltering.value = false
  }
}

function resetSelectionState() {
  selectedOrders.value = []
  allSelected.value = false
  showDetails.value = false
  selectedOrderDetails.value = []
  loadingDetails.value = false
  detailsProgress.value = 0
  detailsTotal.value = 0
}

function onTableSelectionChange(keys: string[], selectedRows: QualityReportItem[]) {
  allSelected.value = keys.length === rows.value.length && rows.value.length > 0
  if (keys.length > 0) {
    message.value = `已选择 ${keys.length} 个订单`

    if (showDetails.value) {
      loadSelectedOrderDetails()
    }
  } else {
    message.value = String(t('qualityReport.pleaseSelectOrder'))
    selectedOrderDetails.value = []
  }
}

function onTableSortChange(field: string, order: 'asc' | 'desc') {
  console.log(`排序: ${field} ${order}`)
}

async function loadSelectedOrderDetails() {
  if (selectedOrders.value.length === 0) {
    selectedOrderDetails.value = []
    return
  }

  loadingDetails.value = true
  detailsProgress.value = 0
  detailsTotal.value = selectedOrders.value.length
  selectedOrderDetails.value = []

  try {
    const batchSize = 10
    const allDetails: QualityReportDetailItem[] = []

    for (let i = 0; i < selectedOrders.value.length; i += batchSize) {
      const batch = selectedOrders.value.slice(i, i + batchSize)

      try {
        const resp = await qualityReportApi.getBatchDetails(batch)

        if (resp.success && resp.data && resp.data.details) {
          allDetails.push(...resp.data.details)
          selectedOrderDetails.value = [...allDetails]
          detailsProgress.value = Math.min(i + batchSize, selectedOrders.value.length)
        } else {
          console.warn(`批次 ${i / batchSize + 1} 获取明细失败:`, resp.message)
        }
      } catch (error: any) {
        console.error(`批次 ${i / batchSize + 1} 加载异常:`, error)
      }

      await new Promise(resolve => setTimeout(resolve, 100))
    }

    if (allDetails.length === 0) {
      toastRef.value?.warning(String(t('qualityReport.noDetailData')), '提示')
    }
  } catch (error: any) {
    console.error('渐进式加载明细异常:', error)
    toastRef.value?.error(String(t('qualityReport.previewFailed', { message: error.message || t('errors.networkRetry') })))
  } finally {
    loadingDetails.value = false
  }
}

function toggleDetailsView() {
  showDetails.value = !showDetails.value
  if (showDetails.value) {
    loadSelectedOrderDetails()
  }
}

async function streamingPreview() {
  if (selectedOrders.value.length === 0) {
    toastRef.value?.warning(String(t('qualityReport.pleaseSelectOrder')), '提示')
    return
  }

  if (!sameGradeValidation.value) {
    toastRef.value?.warning(String(t('qualityReport.gradeMismatch')), '提示')
    return
  }

  // TODO: 实现预览逻辑
  console.log('预览订单:', selectedOrders.value)
}

async function downloadFile(format: 'excel' | 'pdf') {
  if (selectedOrders.value.length === 0) {
    toastRef.value?.warning(String(t('qualityReport.pleaseSelectOrder')), '提示')
    return
  }

  if (!sameGradeValidation.value) {
    toastRef.value?.warning(String(t('qualityReport.gradeMismatch')), '提示')
    return
  }

  await qualityReportApi.downloadFile(selectedOrders.value, format)
}

async function transmitToLme() {
  if (selectedOrders.value.length === 0) {
    toastRef.value?.warning(String(t('qualityReport.pleaseSelectOrder')), '提示')
    return
  }

  if (!sameGradeValidation.value) {
    toastRef.value?.warning(String(t('qualityReport.gradeMismatch')), '提示')
    return
  }

  await qualityReportApi.transmitToLme(selectedOrders.value)
}

async function printReport() {
  if (selectedOrders.value.length === 0) {
    toastRef.value?.warning(String(t('qualityReport.pleaseSelectOrder')), '提示')
    return
  }

  if (!sameGradeValidation.value) {
    toastRef.value?.warning(String(t('qualityReport.gradeMismatch')), '提示')
    return
  }

  await qualityReportApi.printReport(selectedOrders.value)
}

onMounted(() => {
  fetchData(true)
})
</script>

<style scoped lang="scss">
.page {
  width: 100%;
  min-width: 0;
  min-height: 100%;
  padding: 20px;
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
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
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

.filter-section {
  margin-bottom: 20px;
}

.action-bar {
  display: flex;
  gap: 8px;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--text-dim);
  width: 100%;
  min-height: 40px;
  box-sizing: border-box;
}

.status-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.record-count-sep {
  opacity: 0.35;
  color: var(--text-dim);
}

.api-result-panel {
  margin-bottom: 16px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-glass);
}

.api-result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-main);
}

.api-result-content {
  background: var(--bg-light);
  padding: 12px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--text-dim);
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.details-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border-glass);
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.details-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-main);
  margin: 0;
}

.grade-warning {
  padding: 8px 12px;
  background: var(--color-warning-light);
  color: var(--color-warning-dark);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  margin-bottom: 16px;
}

.progress-container {
  margin-top: 12px;
}

.progress-bar {
  height: 4px;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: var(--font-size-sm);
  color: var(--text-dim);
}

// .detail-table-wrapper {
//   margin-top: 16px;
// }
</style>
