<template>
  <div class="page">
    <div class="card">
      <div class="title-row">
        <div>
          <h1>质量报告查询</h1>
          <div class="subtitle">按时间范围查询质量检测结果</div>
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
        <div class="action-bar">
          <t-button
            class="action-preview"
            theme="primary"
            size="small"
            variant="base"
            :disabled="!canDownload"
            @click="streamingPreview"
          >
            预览
          </t-button>
          <t-button
            theme="success"
            size="small"
            variant="base"
            :disabled="!canDownload"
            @click="downloadFile('excel')"
          >
            下载Excel
          </t-button>
          <t-button
            theme="success"
            size="small"
            variant="base"
            :disabled="!canDownload"
            @click="downloadFile('pdf')"
          >
            下载PDF
          </t-button>
          <t-button
            theme="warning"
            size="small"
            variant="base"
            :disabled="!canDownload"
            @click="transmitToLme"
          >
            传输LME
          </t-button>
          <t-button
            class="action-print"
            theme="primary"
            size="small"
            variant="base"
            :disabled="!canDownload"
            @click="printReport"
          >
            打印
          </t-button>
        </div>
      </div>

      <div class="status-bar">
        <div>{{ message }}</div>
        <div>共 {{ rows.length }} 条记录</div>
      </div>

      <div v-if="lmeResponseText" class="api-result-panel">
        <div class="api-result-header">
          <span>LME返回结果</span>
          <t-button size="small" theme="default" variant="outline" @click="lmeResponseText = ''">
            清空
          </t-button>
        </div>
        <pre class="api-result-content">{{ lmeResponseText }}</pre>
      </div>

      <JoTable
        ref="tableRef"
        :data="rows"
        :columns="tableColumns"
        row-key="orderNumber"
        :selectable="true"
        v-model:selected-keys="selectedOrders"
        :filterable="true"
        max-height="520px"
        @selection-change="onTableSelectionChange"
        @sort-change="onTableSortChange"
      >
        <template #cell-createTime="{ value }">
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
          <div>
            <h3 class="details-title">选中订单明细</h3>
            <div class="status-bar">
              已选择 {{ selectedOrders.length }} 个订单，共计 {{ selectedOrderDetails.length }} 行
              <span v-if="selectedOrders.length > 1 && !sameGradeValidation">（不同品位，无法合并导出）</span>
            </div>
            <!-- 进度条 -->
            <div v-if="loadingDetails" class="progress-container">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: (detailsProgress / detailsTotal) * 100 + '%' }"></div>
              </div>
              <div class="progress-text">
                正在加载明细数据... {{ detailsProgress }}/{{ detailsTotal }} 个订单
              </div>
            </div>
          </div>
          <t-button
            theme="primary"
            size="small"
            variant="base"
            :loading="loadingDetails"
            :disabled="loadingDetails"
            @click="toggleDetailsView"
          >
            {{ loadingDetails ? '加载中' : (showDetails ? '隐藏明细' : '显示明细') }}
          </t-button>
        </div>
        
        <div class="grade-warning" v-if="selectedOrders.length > 1 && !sameGradeValidation">
          ⚠️ 选中订单的牌号不一致，无法合并导出。请选择相同牌号的订单进行合并导出。
        </div>

        <div v-if="showDetails && selectedOrderDetails.length > 0" class="detail-table-wrapper">
          <JoTable
            ref="detailTableRef"
            :data="selectedOrderDetails"
            :columns="detailTableColumns"
            row-key="barcode"
            :selectable="false"
            :showIndex="true"
            :showFilters="true"
            max-height="400px"
            class="detail-jo-table"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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

/** 日期弹层挂在子应用根节点，避免 qiankun 场景下层级异常 */
const datePopupProps = { attach: '.qm-app' as const }

const formatDate = (date: Date) => {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

const startDate = ref(formatDate(firstDay))
// Search fields configuration
const searchFields: SearchField[] = [
  { key: 'dateRange', label: 'Business date', type: 'date-range', startPlaceholder: 'Start date', endPlaceholder: 'End date' },
  { key: 'orderNumber', label: 'Order number', type: 'text', placeholder: 'Supports fuzzy search' },
  { key: 'grade', label: 'Grade', type: 'text', placeholder: 'Supports fuzzy search' },
  { key: 'lmeStatus', label: 'LME status', type: 'select', options: [
      { label: 'All', value: '' },
      { label: 'Transmitted', value: 'Success' },
      { label: 'Failed', value: 'Failed' }
    ] 
  }
]

// Search values - initialize with default date values
const searchValues = ref<Record<string, any>>({
  dateRange_start: startDate.value,
  dateRange_end: formatDate(lastDay)
})
const endDateForDisplay = ref(formatDate(lastDay))
const endDate = ref(formatDate(new Date(lastDay.getTime() + 24 * 60 * 60 * 1000)))
const orderNumber = ref('')
const grade = ref('')
const lmeStatus = ref('')
const rows = ref<any[]>([])
const loading = ref(false)
const isFiltering = ref(false)
const statusText = ref('就绪')
const hasError = ref(false)
const message = ref(`默认查询 ${startDate.value} ~ ${endDateForDisplay.value} 数据`)
const selectedOrders = ref<string[]>([])
const allSelected = ref(false)
const activeDateRange = ref('')
const showDetails = ref(false)
const selectedOrderDetails = ref<any[]>([])
const loadingDetails = ref(false)
const detailsProgress = ref(0)
const detailsTotal = ref(0)
const lmeResponseText = ref('')
// 搜索面板引用
const searchPanelRef = ref<InstanceType<typeof JoSearchPanel>>()

// 日期快捷键
const dateShortcuts = ref(['本月', '上月', '本季', '上季', '今日', '昨日'])

// 表格列配置
const tableColumns: JoTableColumn[] = [
  { key: 'orderNumber', title: '单号', sortable: true, filterable: true, filterPlaceholder: '搜索单号' },
  { key: 'grade', title: '牌号', sortable: true, filterable: true, filterPlaceholder: '搜索牌号' },
  { key: 'totalPackages', title: '总捆数', sortable: true, filterable: true, filterPlaceholder: '搜索捆数' },
  { key: 'totalWeight', title: '总重量', sortable: true, filterable: true, filterPlaceholder: '搜索重量' },
  { key: 'createTime', title: '创建时间', sortable: true, filterable: true, filterPlaceholder: '搜索时间', formatter: (val) => formatDateTime(val) },
  { key: 'lmeStatus', title: 'LME状态', sortable: true, filterable: true, filterPlaceholder: '搜索状态' }
]

// 明细表格列配置
const detailTableColumns: JoTableColumn[] = [
  { key: 'orderNumber', title: '单号', sortable: true, filterable: true, filterPlaceholder: '搜索单号' },
  { key: 'barcode', title: '条码', sortable: true, filterable: true, filterPlaceholder: '搜索条码' },
  { key: 'batchCode', title: '批次号', sortable: true, filterable: true, filterPlaceholder: '搜索批次' },
  { key: 'baleNumber', title: '捆号', sortable: true, filterable: true, filterPlaceholder: '搜索捆号' },
  { key: 'weight', title: '重量', sortable: true, filterable: true, filterPlaceholder: '搜索重量' },
  { key: 'qmGrade', title: '品位', sortable: true, filterable: true, filterPlaceholder: '搜索品位' },
  { key: 'qmBatchCode', title: '批号', sortable: true, filterable: true, filterPlaceholder: '搜索批号' },
  { key: 'si', title: 'Si', sortable: true, filterable: true, filterPlaceholder: '搜索Si' },
  { key: 'fe', title: 'Fe', sortable: true, filterable: true, filterPlaceholder: '搜索Fe' },
  { key: 'zn', title: 'Zn', sortable: true, filterable: true, filterPlaceholder: '搜索Zn' },
  { key: 'ga', title: 'Ga', sortable: true, filterable: true, filterPlaceholder: '搜索Ga' },
  { key: 'v', title: 'V', sortable: true, filterable: true, filterPlaceholder: '搜索V' },
  { key: 'cr', title: 'Cr', sortable: true, filterable: true, filterPlaceholder: '搜索Cr' },
  { key: 'cu', title: 'Cu', sortable: true, filterable: true, filterPlaceholder: '搜索Cu' },
  { key: 'mg', title: 'Mg', sortable: true, filterable: true, filterPlaceholder: '搜索Mg' },
  { key: 'mn', title: 'Mn', sortable: true, filterable: true, filterPlaceholder: '搜索Mn' },
  { key: 'ni', title: 'Ni', sortable: true, filterable: true, filterPlaceholder: '搜索Ni' },
  { key: 'ti', title: 'Ti', sortable: true, filterable: true, filterPlaceholder: '搜索Ti' },
  { key: 'al', title: 'Al', sortable: true, filterable: true, filterPlaceholder: '搜索Al' },
  { key: 'otherS_total', title: 'OtherS_total', sortable: true, filterable: true, filterPlaceholder: '搜索OtherS' }
]

// 明细表格引用
const detailTableRef = ref<InstanceType<typeof JoTable>>()

// 主表格引用
const tableRef = ref<InstanceType<typeof JoTable>>()

// 计算属性
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

const disabledStartDate = (date: string | number | Date) => {
  if (!endDateForDisplay.value) return false
  return toDayStart(date).getTime() > toDayStart(endDateForDisplay.value).getTime()
}

const disabledEndDate = (date: string | number | Date) => {
  if (!startDate.value) return false
  return toDayStart(date).getTime() < toDayStart(startDate.value).getTime()
}

// 方法
const onStartPickerChange = (val: string) => {
  if (!val) return
  const validated = validateDate(val)
  if (validated !== val) {
    startDate.value = validated || formatDate(new Date())
  }
}

const onEndPickerChange = (val: string) => {
  if (!val) return
  // 截止日期加一天，因为后端查询是 CTIME < EndDate
  const displayDate = new Date(endDateForDisplay.value)
  const nextDay = new Date(displayDate.getTime() + 24 * 60 * 60 * 1000)
  endDate.value = formatDate(nextDay)
}

// 处理搜索
function handleSearch(values: Record<string, any>) {
  // 同步到原有变量保持兼容
  if (values.dateRange_start) startDate.value = values.dateRange_start
  if (values.dateRange_end) {
    // 截止日期需要加一天，因为后端查询是 CTIME < EndDate
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
  // 重置为本月默认值
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
  
  // 更新搜索面板的值
  const newValues = {
    ...searchValues.value,
    dateRange_start: formatDate(firstDay),
    dateRange_end: formatDate(lastDay)
  }
  searchPanelRef.value?.setValues(newValues)
  
  // 触发搜索
  handleSearch(newValues)
}

// 校验并修正日期
const validateDate = (dateStr: string) => {
  const date = new Date(dateStr)
  // 检查是否为有效日期
  if (isNaN(date.getTime())) {
    return null
  }
  // 检查日期是否与输入一致（防止2月30日这样的无效日期被自动修正）
  const formatted = formatDate(date)
  return formatted === dateStr ? dateStr : formatted
}

async function fetchData(isInitial: boolean) {
  loading.value = true
  isFiltering.value = true
  hasError.value = false
  statusText.value = '正在查询...'
  resetSelectionState()
  lmeResponseText.value = ''
  
  // 构建查询参数
  const params = new URLSearchParams()
  if (startDate.value) params.append('startDate', startDate.value)
  if (endDate.value) params.append('endDate', endDate.value)
  if (orderNumber.value.trim()) params.append('orderNumber', orderNumber.value.trim())
  if (grade.value.trim()) params.append('grade', grade.value.trim())
  if (lmeStatus.value.trim()) params.append('lmeStatus', lmeStatus.value.trim())
  
  const searchInfo = []
  if (startDate.value && endDate.value) searchInfo.push(`时间范围：${startDate.value} ~ ${endDate.value}`)
  if (orderNumber.value.trim()) searchInfo.push(`单号：${orderNumber.value.trim()}`)
  if (grade.value.trim()) searchInfo.push(`牌号：${grade.value.trim()}`)
  if (lmeStatus.value.trim()) searchInfo.push(`LME状态：${lmeStatus.value.trim()}`)
  
  message.value = searchInfo.length > 0 ? `查询条件：${searchInfo.join('，')}` : '查询所有数据'

  try {
    const resp = await fetch(`/api/qm/quality-report?${params.toString()}`)

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
      throw new Error(`JSON解析失败: ${parseError instanceof Error ? parseError.message : String(parseError)}. 响应内容: ${responseText.substring(0, 200)}`)
    }

    if (json.success && json.data) {
      rows.value = json.data || []
      statusText.value = '查询完成'
      hasError.value = false
      
      // 查询时清空选择状态，确保数据一致性
      resetSelectionState()
      
      const recordCount = json.data.length || 0
      message.value = isInitial 
        ? `默认查询完成，共 ${recordCount} 条记录` 
        : `查询完成，共 ${recordCount} 条记录`
      // 强制界面刷新，确保checkbox状态正确
      await new Promise(resolve => setTimeout(resolve, 100))
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

// 重置所有筛选条件
function resetFilters() {
  // 重置日期为本月
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  const firstDay = new Date(currentYear, currentMonth, 1)
  const lastDay = new Date(currentYear, currentMonth + 1, 0)
  
  startDate.value = formatDate(firstDay)
  endDateForDisplay.value = formatDate(lastDay)
  endDate.value = formatDate(new Date(lastDay.getTime() + 24 * 60 * 60 * 1000))
  
  // 重置其他查询条件
  orderNumber.value = ''
  grade.value = ''
  activeDateRange.value = ''
  
  // 调用表格组件的 reset 方法
  tableRef.value?.reset()
  
  // 重置选择状态
  resetSelectionState()
  lmeResponseText.value = ''
  
  // 清空数据
  rows.value = []
  
  // 更新状态消息
  statusText.value = '就绪'
    // 同步搜索值到 JoSearchPanel
    const newSearchValues: Record<string, any> = {}
    if (startDate.value) newSearchValues.dateRange_start = startDate.value
    if (endDateForDisplay.value) newSearchValues.dateRange_end = endDateForDisplay.value
    if (orderNumber.value) newSearchValues.orderNumber = orderNumber.value
    if (grade.value) newSearchValues.grade = grade.value
    searchValues.value = newSearchValues
}

// 表格选择变化处理
function onTableSelectionChange(keys: string[], selectedRows: any[]) {
  allSelected.value = keys.length === rows.value.length && rows.value.length > 0
  if (keys.length > 0) {
    fetchDetailCounts(keys).then(counts => {
      const totalDetailCount = keys.reduce((sum, orderNumber) => {
        return sum + (counts[orderNumber] || 0)
      }, 0)
      message.value = `已选择 ${keys.length} 个订单, 共计 ${totalDetailCount} 行`
    }).catch(() => {
      message.value = `已选择 ${keys.length} 个订单`
    })
    
    // 如果已经显示明细，重新加载明细数据
    if (showDetails.value) {
      loadSelectedOrderDetails()
    }
  } else {
    message.value = '请选择单号'
    selectedOrderDetails.value = []
  }
}

// 表格排序变化处理
function onTableSortChange(field: string, order: 'asc' | 'desc') {
  // 排序已在组件内部处理，这里可以添加额外的逻辑（如记录日志等）
  console.log(`排序: ${field} ${order}`)
}

// 存储明细行数的缓存
const detailCountCache = ref<Record<string, number>>({})

// 获取明细行数的函数
async function fetchDetailCounts(orderNumbers: string[]) {
  if (orderNumbers.length === 0) return {}
  
  try {
    const resp = await fetch('/api/qm/quality-report/detail-counts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderNumbers)
    })
    
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}: ${resp.statusText}`)
    }
    
    const json = await resp.json()
    if (json.success && json.data) {
      // 更新缓存
      Object.assign(detailCountCache.value, json.data)
      return json.data
    } else {
      throw new Error(json.message || '获取明细行数失败')
    }
  } catch (error) {
    console.error('获取明细行数失败:', error)
    return {}
  }
}

function selectOrder(orderNumber: string) {
  selectedOrders.value = [orderNumber]
  
  // 异步获取明细行数
  fetchDetailCounts([orderNumber]).then(counts => {
    const detailCount = counts[orderNumber] || 0
    message.value = `已选择订单: ${orderNumber}, 共计 ${detailCount} 行`
  }).catch(() => {
    message.value = `已选择订单: ${orderNumber}`
  })
}

function onSelectAllCheckboxChange(checked: boolean) {
  if (checked) {
    selectedOrders.value = rows.value.map((row: any) => row.orderNumber)
    allSelected.value = rows.value.length > 0
    if (selectedOrders.value.length > 0) {
      fetchDetailCounts(selectedOrders.value).then(counts => {
        const totalDetailCount = selectedOrders.value.reduce((sum, orderNumber) => {
          return sum + (counts[orderNumber] || 0)
        }, 0)
        message.value = `已选择所有 ${selectedOrders.value.length} 个订单, 共计 ${totalDetailCount} 行`
      }).catch(() => {
        message.value = `已选择所有 ${selectedOrders.value.length} 个订单`
      })
    }
  } else {
    selectedOrders.value = []
    allSelected.value = false
    message.value = '已取消选择'
  }
}

// 加载选中订单的明细数据
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
    // 分批渐进式加载，每批处理一定数量的订单
    const batchSize = 10 // 每批10个订单，避免一次性加载太多
    const allDetails: any[] = []
    
    for (let i = 0; i < selectedOrders.value.length; i += batchSize) {
      const batch = selectedOrders.value.slice(i, i + batchSize)
      
      try {
        // 使用批量查询接口
        const resp = await fetch('/api/qm/quality-report/details/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(batch)
        })
        
        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status}`)
        }
        
        const json = await resp.json()
        
        if (json.success && json.data && json.data.details) {
          // 立即显示这批数据
          allDetails.push(...json.data.details)
          selectedOrderDetails.value = [...allDetails]
          
          // 更新进度
          detailsProgress.value = Math.min(i + batchSize, selectedOrders.value.length)
        } else {
          console.warn(`批次 ${i/batchSize + 1} 获取明细失败:`, json.message)
        }
      } catch (error: any) {
        console.error(`批次 ${i/batchSize + 1} 加载异常:`, error)
        // 继续处理下一批，不中断整个加载过程
      }
      
      // 给用户一点视觉反馈时间
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    if (allDetails.length === 0) {
      alert('没有获取到任何明细数据')
    }
  } catch (error: any) {
    console.error('渐进式加载明细异常:', error)
    alert(`加载明细失败: ${error.message || '网络错误'}`)
  } finally {
    loadingDetails.value = false
  }
}

// 预览函数
async function streamingPreview() {
  if (selectedOrders.value.length === 0) {
    alert('请先选择单号')
    return
  }

  if (!sameGradeValidation.value) {
    alert('选中订单的牌号不一致，无法合并导出。请选择相同牌号的订单。')
    return
  }

  // 在函数开始处声明previewWindow
  let previewWindow: Window | null = null

  const updatePreviewProgress = (received: number, total = 0) => {
    if (!previewWindow || previewWindow.closed) return

    const progressBarEl = previewWindow.document.getElementById('progressBar') as HTMLElement | null
    const receivedEl = previewWindow.document.getElementById('received')
    const statusEl = previewWindow.document.getElementById('status')

    if (progressBarEl) {
      const percent = total > 0 ? Math.min((received / total) * 100, 95) : 0
      progressBarEl.style.width = `${percent}%`
    }
    if (receivedEl) {
      receivedEl.textContent = received > 0
        ? `文件大小: ${(received / 1024).toFixed(1)} KB`
        : '正在准备预览文件...'
    }
    if (statusEl) {
      if (received > 50 * 1024) {
        statusEl.textContent = 'PDF渲染中...'
      } else if (received > 10 * 1024) {
        statusEl.textContent = '正在下载PDF内容...'
      }
    }
  }

  const showPreviewPdf = (blob: Blob) => {
    if (!previewWindow || previewWindow.closed) return

    const loadingEl = previewWindow.document.querySelector('.loading') as HTMLElement | null
    const pdfContainerEl = previewWindow.document.getElementById('pdfContainer') as HTMLElement | null
    const pdfFrameEl = previewWindow.document.getElementById('pdfFrame') as HTMLIFrameElement | null
    const progressBarEl = previewWindow.document.getElementById('progressBar') as HTMLElement | null
    const statusEl = previewWindow.document.getElementById('status')
    const receivedEl = previewWindow.document.getElementById('received')

    if (loadingEl) {
      loadingEl.style.display = 'none'
    }
    if (pdfContainerEl) {
      pdfContainerEl.style.display = 'block'
    }
    if (pdfFrameEl) {
      // 使用Data URL而不是blob URL，更稳定
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        pdfFrameEl.src = dataUrl
      }
      reader.onerror = () => {
        console.error('读取PDF数据失败')
        showPreviewError('PDF数据读取失败')
      }
      reader.readAsDataURL(blob)
    }
    if (progressBarEl) {
      progressBarEl.style.width = '100%'
    }
    if (statusEl) {
      statusEl.textContent = '预览已就绪'
    }
    if (receivedEl) {
      receivedEl.textContent = `文件大小: ${(blob.size / 1024).toFixed(1)} KB`
    }
  }

  const showPreviewError = (errorText: string) => {
    if (!previewWindow || previewWindow.closed) {
      return
    }

    const statusEl = previewWindow.document.getElementById('status')
    const progressBarEl = previewWindow.document.getElementById('progressBar')
    if (statusEl) {
      statusEl.textContent = `❌ ${errorText}`
    }
    if (progressBarEl) {
      ;(progressBarEl as HTMLElement).style.background = '#f44336'
    }
  }

  try {
    const orderCount = selectedOrders.value.length
    message.value = orderCount > 1 ? `正在预览 ${orderCount} 个订单...` : '正在预览...'

    // 创建预览窗口
    previewWindow = window.open('', '_blank', 'width=800,height=600')
    
    if (!previewWindow) {
      throw new Error('无法打开预览窗口，请检查浏览器弹窗设置')
    }

    // 显示初始加载界面
    previewWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>PDF流式预览</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * {
              box-sizing: border-box;
            }
            html, body {
              width: 100%;
              height: 100%;
              overflow: hidden;
            }
            body { 
              margin: 0; 
              padding: 0;
              font-family: Arial, sans-serif;
              background: linear-gradient(180deg, #eef4ff 0%, #f8fafc 100%);
              color: #0f172a;
            }
            .preview-shell {
              height: 100vh;
              display: flex;
              flex-direction: column;
              overflow: hidden;
            }
            .loading {
              width: min(520px, calc(100vw - 32px));
              margin: auto;
              text-align: center;
              padding: 32px 28px;
              background: rgba(255,255,255,0.96);
              border-radius: 18px;
              box-shadow: 0 18px 50px rgba(15, 23, 42, 0.12);
              border: 1px solid rgba(148, 163, 184, 0.2);
            }
            .loading h2 {
              margin: 0 0 8px;
              font-size: 22px;
            }
            .loading-subtitle {
              color: #64748b;
              font-size: 14px;
              margin-bottom: 20px;
            }
            .progress {
              width: 100%;
              height: 8px;
              background: #e2e8f0;
              border-radius: 999px;
              overflow: hidden;
              margin: 20px 0 14px;
            }
            .progress-bar {
              height: 100%;
              background: linear-gradient(90deg, #2563eb 0%, #38bdf8 100%);
              width: 0%;
              transition: width 0.3s ease;
            }
            .status {
              color: #475569;
              margin: 8px 0;
              font-size: 14px;
            }
            .pdf-container {
              display: none;
              flex: 1;
              width: 100%;
              padding: 0;
              background: #fff;
              overflow: hidden;
            }
            .pdf-frame {
              width: 100%;
              height: 100%;
              border: none;
              background: white;
              display: block;
            }
            @media (max-width: 768px) {
              .loading {
                padding: 24px 20px;
                border-radius: 14px;
              }
              .loading h2 {
                font-size: 18px;
              }
              .pdf-container {
                padding: 0;
              }
              .pdf-frame {
                height: 100%;
              }
            }
          </style>
        </head>
        <body>
          <div class="preview-shell">
            <div class="loading">
              <h2>PDF 预览加载中</h2>
              <div class="loading-subtitle">正在生成报告并准备浏览器预览</div>
              <div class="progress">
                <div class="progress-bar" id="progressBar"></div>
              </div>
              <div class="status" id="status">正在连接服务器...</div>
              <div class="status" id="received">正在准备预览文件...</div>
            </div>
            <div class="pdf-container" id="pdfContainer">
              <iframe id="pdfFrame" class="pdf-frame"></iframe>
            </div>
          </div>
        </body>
      </html>`)
    previewWindow.document.close()

    // 开始接收PDF数据
    console.log('开始预览...')
    
    // 更新状态为正在下载
    if (previewWindow) {
      try {
        updatePreviewProgress(0, 100)
        const statusEl = previewWindow.document.getElementById('status')
        if (statusEl) {
          statusEl.textContent = '正在生成PDF...'
        }
      } catch (e) {
        console.log('更新状态失败:', e)
      }
    }
    
    const resp = await fetch('/api/qm/quality-report/preview-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        orderNumbers: selectedOrders.value,
        templateName: "COA"
      })
    })

    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}: ${resp.statusText}`)
    }

    // 检查响应类型
    const contentType = resp.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      // 预览模式：返回Base64数据
      const responseText = await resp.text()
      let json
      try {
        json = JSON.parse(responseText)
      } catch {
        throw new Error(`响应解析失败: ${responseText}`)
      }
      
      if (json.success && json.data && json.data.base64Data) {
        // 将Base64转换为Blob
        const base64Data = json.data.base64Data
        const binaryString = atob(base64Data)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        const blob = new Blob([bytes], { type: 'application/pdf' })
        
        if (previewWindow) {
          updatePreviewProgress(blob.size, blob.size)
          showPreviewPdf(blob)
        }
        message.value = '预览已在新窗口中打开'
      } else {
        throw new Error(json.message || '预览数据格式错误')
      }
    } else if (contentType && contentType.includes('application/pdf')) {
      // 直接PDF文件流（下载模式）
      const blob = await resp.blob()
      if (previewWindow) {
        updatePreviewProgress(blob.size, blob.size)
        showPreviewPdf(blob)
      }
      message.value = '预览已在新窗口中打开'
    } else {
      // 错误响应
      const responseText = await resp.text()
      let json
      try {
        json = JSON.parse(responseText)
      } catch {
        throw new Error(`预览失败: ${responseText}`)
      }
      throw new Error(json.message || '预览失败')
    }
    setTimeout(() => {
      message.value = ''
    }, 3000)

  } catch (error) {
    console.error('预览失败:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    message.value = `预览失败: ${errorMessage}`
    
    // 尝试在预览窗口显示错误
    try {
      if (previewWindow && !previewWindow.closed) {
        showPreviewError(errorMessage)
      }
    } catch (e) {
      console.log('无法在预览窗口显示错误')
    }
    
    setTimeout(() => {
      message.value = ''
    }, 5000)
  }
}

// 简化的预览函数（使用流式预览）
async function previewReport() {
  // 直接调用流式预览
  return streamingPreview()
}

// 生命周期
async function downloadFile(type: string) {
  if (selectedOrders.value.length === 0) {
    alert('请先选择单号')
    return
  }

  if (!sameGradeValidation.value) {
    alert('选中订单的牌号不一致，无法合并导出。请选择相同牌号的订单。')
    return
  }

  try {
    const orderCount = selectedOrders.value.length
    message.value = orderCount > 1 ? `正在生成并下载 ${orderCount} 个订单的${type.toUpperCase()}文件...` : `正在生成并下载${type.toUpperCase()}文件...`

    const resp = await fetch(`/api/qm/quality-report/download-${type}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        orderNumbers: selectedOrders.value,
        templateName: "COA"
      })
    })

    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}: ${resp.statusText}`)
    }

    // 检查响应是否为文件下载
    const contentType = resp.headers.get('content-type')
    if (contentType && (contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') || 
                        contentType.includes('application/pdf'))) {
      // 文件下载
      const blob = await resp.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      
      // 从响应头获取文件名，如果没有则生成一个
      const contentDisposition = resp.headers.get('content-disposition')
      let fileName = `quality_report_${type}_${new Date().getTime()}`
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1].replace(/['"]/g, '')
        }
      }
      
      a.download = fileName.endsWith(type === 'excel' ? '.xlsx' : '.pdf') ? fileName : `${fileName}.${type === 'excel' ? 'xlsx' : 'pdf'}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      message.value = orderCount > 1 ? `${type.toUpperCase()}文件下载成功: ${a.download}` : `${type.toUpperCase()}文件下载成功`
    } else {
      // 错误响应
      const responseText = await resp.text()
      let json
      try {
        json = JSON.parse(responseText)
      } catch {
        throw new Error(`下载失败: ${responseText}`)
      }
      throw new Error(json.message || '下载失败')
    }
  } catch (error: any) {
    console.error(`下载${type}失败:`, error)
    message.value = `下载${type}失败: ${error.message}`
  }
}

async function transmitToLme() {
  if (selectedOrders.value.length === 0) {
    message.value = '请先选择单号'
    return
  }

  if (!sameGradeValidation.value) {
    message.value = '选中订单的牌号不一致，无法传输。请选择相同牌号的订单。'
    return
  }

  try {
    const orderCount = selectedOrders.value.length
    message.value = orderCount > 1 ? `正在传输 ${orderCount} 个订单到LME...` : '正在传输订单到LME...'
    lmeResponseText.value = ''

    const resp = await fetch('/api/qm/quality-report/transmit-lme', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        orderNumbers: selectedOrders.value
      })
    })

    const responseText = await resp.text()
    let json
    try {
      json = JSON.parse(responseText)
    } catch {
      throw new Error(`传输失败: ${responseText}`)
    }

    lmeResponseText.value = JSON.stringify(json, null, 2)

    if (json.success && json.message) {
      // 成功响应，更新表格中的LME状态
      selectedOrders.value.forEach(orderNumber => {
        const row = rows.value.find(r => r.orderNumber === orderNumber)
        if (row) {
          row.lmeStatus = 'Success'
        }
      })
      
      message.value = `LME传输成功: ${json.message}`
      
      // 可选：刷新数据以更新LME状态
      setTimeout(() => {
        fetchData(false)
      }, 2000)
    } else {
      // 失败响应，更新表格中的LME状态
      selectedOrders.value.forEach(orderNumber => {
        const row = rows.value.find(r => r.orderNumber === orderNumber)
        if (row) {
          row.lmeStatus = '传输失败'
        }
      })
      
      throw new Error(json.message || 'LME传输失败')
    }
  } catch (error: any) {
    console.error('LME传输失败:', error)
    message.value = `LME传输失败: ${error.message}`
    
    // 更新表格中的LME状态为失败
    selectedOrders.value.forEach(orderNumber => {
      const row = rows.value.find(r => r.orderNumber === orderNumber)
      if (row) {
        row.lmeStatus = '传输失败'
      }
    })
  }
}

function printReport() {
  if (selectedOrders.value.length === 0) {
    alert('请先选择单号')
    return
  }

  if (!sameGradeValidation.value) {
    alert('选中订单的牌号不一致，无法打印。请选择相同牌号的订单。')
    return
  }

  // 直接调用预览，然后用户可以在浏览器中打印
  previewReport()
}

function formatDateTime(dateStr: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

function goHome() {
  const bridge = (window as any).qmBridge
  if (bridge && typeof bridge.navigateHome === 'function') {
    bridge.navigateHome()
    return
  }

  router.push('/')
}

// 日期快捷选择功能
function setDateRange(range: string) {
  activeDateRange.value = range;
  const now = new Date();

  let start: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let end: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  switch (range) {
    case 'today':
      // 今天 00:00:00 至 明天 00:00:00
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      break;
    case 'yesterday':
      // 昨天 00:00:00 至 今天 00:00:00
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'currentMonth':
      // 本月 1 号 00:00:00 至 下月 1 号 00:00:00
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      break;
    case 'lastMonth':
      // 上月 1 号 00:00:00 至 本月 1 号 00:00:00
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'currentQuarter': {
      // 计算当前季度（0-3，对应Q1-Q4）
      const quarter = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), quarter * 3, 1);
      end = new Date(now.getFullYear(), quarter * 3 + 3, 1);
      break;
    }
    case 'lastQuarter': {
      // 计算上一季度（用let声明，支持重新赋值）
      let lastQuarter = Math.floor(now.getMonth() / 3) - 1;
      if (lastQuarter >= 0) {
        // 非跨年：如上季度是Q2（4-6月），则start=4.1，end=7.1
        start = new Date(now.getFullYear(), lastQuarter * 3, 1);
        end = new Date(now.getFullYear(), lastQuarter * 3 + 3, 1);
      } else {
        // 跨年场景（当前Q1）：上季度是去年Q4（10-12月）
        start = new Date(now.getFullYear() - 1, 9, 1); // 去年10月1日
        end = new Date(now.getFullYear(), 0, 1); // 今年1月1日（Q4结束边界）
      }
      break;
    }
    default:
      // 未知范围：保留初始化的"今天"默认值，同时给出警告
      console.warn(`未知的时间范围：${range}，已默认使用今日范围`);
      break;
  }

  // 格式化日期为 YYYY-MM-DD（使用本地时间避免时区问题）
  
  startDate.value = formatDate(start)
  endDate.value = formatDate(end)
  // end 为查询上界（次日 0 点），展示用截止日期为 calendar 上的最后一天
  const displayEnd = new Date(end.getTime() - 24 * 60 * 60 * 1000)
  endDateForDisplay.value = formatDate(displayEnd)
}

// 切换明细显示
function toggleDetailsView() {
  if (showDetails.value) {
    // 隐藏明细
    showDetails.value = false
    selectedOrderDetails.value = []
    loadingDetails.value = false
    detailsProgress.value = 0
    detailsTotal.value = 0
  } else {
    // 显示明细前检查数量
    if (selectedOrders.value.length > 100) {
      const confirmed = confirm(`您选择了 ${selectedOrders.value.length} 个订单，加载明细数据可能需要较长时间。确定要继续吗？`)
      if (!confirmed) {
        return
      }
    }
    showDetails.value = true
    loadSelectedOrderDetails()
  }
}

// 生命周期
onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  const auto = params.get('auto') === '1' || params.get('autoQuery') === '1'

  if (auto) {
    fetchData(true)
  } else {
    statusText.value = '就绪'
    message.value = '请选择时间范围并点击"查询"'
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

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-inline {
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.field span {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  letter-spacing: 0.02em;
}

.field-inline span {
  width: 66px;
  flex: 0 0 66px;
  white-space: nowrap;
}

.main-content-row {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.action-section {
  display: flex;
  justify-content: space-between;
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

.action-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

/* 接近原自定义色：预览偏靛、打印偏紫 */
.action-preview:deep(.t-button--theme-primary) {
  --td-brand-color: #6366f1;
  --td-brand-color-hover: #4f46e5;
  --td-brand-color-active: #4338ca;
}

.action-print:deep(.t-button--theme-primary) {
  --td-brand-color: #8b5cf6;
  --td-brand-color-hover: #7c3aed;
  --td-brand-color-active: #6d28d9;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 6px;
  font-size: 12px;
  color: #64748b;
}

.api-result-panel {
  margin: 14px 0 12px;
  border: 1px solid #dbe7ff;
  border-radius: 12px;
  background: linear-gradient(180deg, #f8fbff, #fdfefe);
  overflow: hidden;
}

.api-result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: rgba(37, 99, 235, 0.06);
  border-bottom: 1px solid #e3ecff;
  color: #315288;
  font-size: 13px;
  font-weight: 600;
}

.api-result-content {
  margin: 0;
  padding: 14px;
  max-height: 220px;
  overflow: auto;
  background: transparent;
  color: #334155;
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 明细区域 */
.details-section {
  margin-top: 24px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

/* 明细表格样式 - 覆盖JoTable变量 */
.detail-table-wrapper {
  overflow: auto;
  max-height: 400px;
}

.detail-jo-table :deep(.jo-table-container) {
  /* 表头 */
  --jo-table-header-bg: #f9fafb;
  --jo-table-header-color: #374151;
  --jo-table-header-padding: 12px 16px;
  --jo-table-header-border: #e5e7eb;
  
  /* 单元格 */
  --jo-table-cell-padding: 8px 12px;
  --jo-table-cell-border: #f3f4f6;
  
  /* 斑马纹和悬停 */
  --jo-table-stripe-bg: #f9fafb;
  --jo-table-hover-bg: #f9fafb;
}

.detail-jo-table :deep(.jo-table th) {
  padding: 12px 16px;
}

.detail-jo-table :deep(.jo-table td) {
  padding: 8px 12px;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px;
}

.details-title {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.details-header :deep(.t-button) {
  flex-shrink: 0;
}

.grade-warning {
  background: #fef3c7;
  color: #92400e;
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  font-size: 13px;
}

.progress-container {
  margin: 8px 0;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #3b82f6;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .main-content-row {
    flex-direction: column;
    gap: 16px;
  }

  .date-shortcuts {
    gap: 4px;
  }

  .date-shortcuts :deep(.t-button) {
    font-size: 11px;
  }
}
</style>
