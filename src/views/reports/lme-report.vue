<template>
  <div class="page">
    <div class="card">
      <div class="title-row">
        <div>
          <h1>LME传输记录</h1>
          <div class="subtitle">按时间范围查询LME传输状态及明细</div>
        </div>
        <div class="title-actions">
          <t-button theme="primary" size="small" variant="base" @click="goHome">
            返回主页
          </t-button>
          <div :class="['status-badge', hasError ? 'status-error' : 'status-ok']">
            {{ statusText }}
          </div>
        </div>
      </div>

      <div class="main-content-row">
        <div class="filter-section">
          <!-- 搜索面板 -->
          <JoSearchPanel
            ref="searchPanelRef"
            :fields="searchFields"
            v-model="searchValues"
            :collapsible="true"
            :collapsed="false"
            @search="handleSearch"
            @reset="handleReset"
          />
        </div>
      </div>

      <div class="action-section">
        <!-- 日期快捷键 -->
        <div class="date-shortcuts">
          <t-button
            v-for="shortcut in dateShortcuts"
            :key="shortcut"
            theme="default"
            size="small"
            variant="text"
            @click="handleDateShortcut(shortcut)"
          >
            {{ shortcut }}
          </t-button>
        </div>
      </div>

      <div class="status-bar">
        <div>{{ message }}</div>
        <div>共 {{ rows.length }} 条记录</div>
      </div>

      <JoTable
        ref="tableRef"
        :data="rows"
        :columns="tableColumns"
        row-key="id"
        :selectable="false"
        :filterable="true"
        max-height="600px"
        @sort-change="onTableSortChange"
      >
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import JoTable from '@/components/basic/table/JoTable.vue'
import JoSearchPanel from '@/components/basic/search-panel/JoSearchPanel.vue'
import type { JoTableColumn } from '@/components/basic/table/JoTable.vue'
import type { SearchField } from '@/components/basic/search-panel/JoSearchPanel.vue'

const router = useRouter()

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
// 搜索字段配置
const searchFields: SearchField[] = [
  { key: 'dateRange', label: '记录时间', type: 'date-range', startPlaceholder: '起始日期', endPlaceholder: '截止日期' },
  { key: 'orderNumber', label: '单号', type: 'text', placeholder: '支持模糊搜索' },
  { key: 'grade', label: '牌号', type: 'text', placeholder: '支持模糊搜索' },
  { key: 'lmeStatus', label: 'LME status', type: 'select', options: [
      { label: 'All', value: '' },
      { label: 'Transmitted', value: 'Success' },
      { label: 'Transmission failed', value: 'Failed' }
    ] 
  }
]

// 搜索值
const endDateForDisplay = ref(formatDate(lastDay))
const searchValues = ref<Record<string, any>>({
  dateRange_start: startDate.value,
  dateRange_end: endDateForDisplay.value,
  lmeStatus: 'Failed' // Default to 'Transmission failed'
})
const endDate = ref(formatDate(new Date(lastDay.getTime() + 24 * 60 * 60 * 1000)))
const orderNumber = ref('')
const grade = ref('')
const lmeStatus = ref('')
const rows = ref<any[]>([])
const loading = ref(false)
const statusText = ref('就绪')
const hasError = ref(false)
const message = ref(`默认查询 ${startDate.value} ~ ${endDateForDisplay.value} 记录`)

// 搜索面板引用
const searchPanelRef = ref<InstanceType<typeof JoSearchPanel>>()

// 日期快捷键
const dateShortcuts = ref(['本月', '上月', '本季', '上季', '今日', '昨日'])

// 表格列配置
const tableColumns: JoTableColumn[] = [
  { key: 'orderNumber', title: '单号', sortable: true, filterable: true, filterPlaceholder: '搜索单号', width: '140px' },
  { key: 'grade', title: '牌号', sortable: true, filterable: true, filterPlaceholder: '搜索牌号', width: '90px' },
  { key: 'totalPackages', title: '总捆数', sortable: true, width: '90px' },
  { key: 'totalWeight', title: '总重量', sortable: true, width: '90px' },
  { key: 'lmeStatus', title: '传输状态', sortable: true, filterable: true, width: '100px' },
  { key: 'createTime', title: '记录时间', sortable: true, width: '160px' },
  { key: 'syncTime', title: '同步LME时间', sortable: true, width: '160px' },
  { key: 'syncUser', title: '同步人', sortable: true, filterable: true, width: '100px' },
  { key: 'lmeMessage', title: 'LME返回信息', sortable: false, filterable: true }
]

// 表格引用
const tableRef = ref<InstanceType<typeof JoTable>>()

// 方法
// 处理搜索
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

// 处理重置
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
  statusText.value = '就绪'
  message.value = '已重置查询条件'
}

// 处理日期快捷键点击
function handleDateShortcut(shortcut: string) {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  
  let firstDay: Date, lastDay: Date
  
  switch (shortcut) {
    case '今日':
      firstDay = new Date(now)
      lastDay = new Date(now)
      break
    case '昨日':
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      firstDay = yesterday
      lastDay = yesterday
      break
    case '本月':
      firstDay = new Date(currentYear, currentMonth, 1)
      lastDay = new Date(currentYear, currentMonth + 1, 0)
      break
    case '上月':
      firstDay = new Date(currentYear, currentMonth - 1, 1)
      lastDay = new Date(currentYear, currentMonth, 0)
      break
    case '本季':
      const currentQuarter = Math.floor(currentMonth / 3)
      firstDay = new Date(currentYear, currentQuarter * 3, 1)
      lastDay = new Date(currentYear, (currentQuarter + 1) * 3, 0)
      break
    case '上季':
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
    dateRange_end: formatDate(lastDay)
  }
  searchPanelRef.value?.setValues(newValues)
  
  handleSearch(newValues)
}

async function fetchData(isInitial: boolean) {
  loading.value = true
  hasError.value = false
  statusText.value = '正在查询...'
  
  const params = new URLSearchParams()
  if (startDate.value) params.append('startDate', startDate.value)
  if (endDate.value) params.append('endDate', endDate.value)
  if (orderNumber.value.trim()) params.append('orderNumber', orderNumber.value.trim())
  if (grade.value.trim()) params.append('grade', grade.value.trim())
  if (lmeStatus.value.trim()) params.append('lmeStatus', lmeStatus.value.trim())
  
  const searchInfo = []
  if (startDate.value && endDate.value) searchInfo.push(`时间范围：${startDate.value} ~ ${endDateForDisplay.value}`)
  if (orderNumber.value.trim()) searchInfo.push(`单号：${orderNumber.value.trim()}`)
  if (grade.value.trim()) searchInfo.push(`牌号：${grade.value.trim()}`)
  if (lmeStatus.value.trim()) searchInfo.push(`状态：${lmeStatus.value.trim()}`)
  
  message.value = searchInfo.length > 0 ? `查询条件：${searchInfo.join('，')}` : '查询所有记录'

  try {
    const resp = await fetch(`/api/qm/lme-report?${params.toString()}`)

    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}: ${resp.statusText}`)
    }

    const responseText = await resp.text()
    if (!responseText.trim()) {
      throw new Error('服务器返回空响应')
    }

    let json
    try {
      json = JSON.parse(responseText)
    } catch (parseError: any) {
      throw new Error(`JSON解析失败: ${parseError instanceof Error ? parseError.message : String(parseError)}`)
    }

    if (json.success && json.data) {
      rows.value = json.data || []
      statusText.value = '查询完成'
      hasError.value = false
      
      const recordCount = json.data.length || 0
      message.value = isInitial 
        ? `默认查询完成，共 ${recordCount} 条记录` 
        : `查询完成，共 ${recordCount} 条记录`
    } else {
      throw new Error(json.message || '查询失败')
    }
  } catch (error) {
    console.error('查询失败:', error)
    statusText.value = '查询失败'
    hasError.value = true
    message.value = `查询失败: ${error instanceof Error ? error.message : String(error)}`
  } finally {
    loading.value = false
  }
}

function onTableSortChange(field: string, order: 'asc' | 'desc') {
  console.log(`排序: ${field} ${order}`)
}

function formatDateTime(dateStr: string) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

function getStatusClass(status: string) {
  if (status === '已传输' || status === '成功') return 'text-success'
  if (status === '传输失败' || status === '失败') return 'text-error'
  return ''
}

function goHome() {
  const bridge = (window as any).qmBridge
  if (bridge && typeof bridge.navigateHome === 'function') {
    bridge.navigateHome()
    return
  }

  router.push('/')
}

// 生命周期
onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  const auto = params.get('auto') === '1' || params.get('autoQuery') === '1'

  // Sync initial searchValues to individual variables
  handleSearch(searchValues.value)

  if (auto) {
    fetchData(true)
  } else {
    // Default load data once
    fetchData(true)
  }
})
</script>

<style scoped>
.page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
  padding: 20px 24px 24px;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-row h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.subtitle {
  color: #6b7280;
  font-size: 14px;
  margin-top: 4px;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
}

.status-ok {
  background: #ecfdf3;
  color: #166534;
}

.status-error {
  background: #fef2f2;
  color: #b91c1c;
}

.main-content-row {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.action-section {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 20px;
  padding: 10px 0;
}

.date-shortcuts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 6px;
  font-size: 12px;
  color: #64748b;
  margin-bottom: 12px;
}

.text-success {
  color: #16a34a;
  font-weight: 500;
}

.text-error {
  color: #dc2626;
  font-weight: 500;
}
</style>
