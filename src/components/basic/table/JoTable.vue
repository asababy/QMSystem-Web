<template>
  <div class="jo-table-container">
    <!-- 表格主体 -->
    <div class="jo-table-wrapper" :style="{ maxHeight: props.maxHeight }">
      <table class="jo-table">
        <thead>
          <!-- 列标题行 -->
          <tr>
            <!-- 扩展按钮列 -->
            <th v-if="props.expandable" class="jo-table-th jo-table-expand-header"></th>
            <!-- 序号列 -->
            <th v-if="props.showIndex" class="jo-table-th jo-table-index">#</th>
            <!-- 选择列 -->
            <th v-if="props.selectable" class="jo-table-th jo-table-check">
              <t-checkbox
                :checked="isAllSelected"
                :indeterminate="isIndeterminate"
                @change="onSelectAllChange"
              />
            </th>
            <!-- 数据列 -->
            <th
              v-for="(col, colIndex) in displayColumns"
              :key="col.key"
              class="jo-table-th"
              :class="{ 'jo-table-sortable': col.sortable !== false }"
              :style="{ width: col.width, minWidth: col.minWidth }"
              @click="col.sortable !== false && toggleSort(col.key)"
              @dblclick="onHeaderDoubleClick(col, colIndex)"
            >
              <div class="jo-table-header-content">
                <span>{{ col.title }}</span>
                <span v-if="sortField === col.key" class="jo-table-sort-icon">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </div>
            </th>
          </tr>
          <!-- 过滤行 -->
          <tr v-if="props.filterable && showFilters" class="jo-table-filter-row">
            <th v-if="props.expandable" class="jo-table-th jo-table-expand-header"></th>
            <th v-if="props.showIndex" class="jo-table-th jo-table-index"></th>
            <th v-if="props.selectable" class="jo-table-th jo-table-check"></th>
            <th
              v-for="col in displayColumns"
              :key="col.key"
              class="jo-table-th"
              :style="{ width: col.width, minWidth: col.minWidth }"
            >
              <t-input
                v-if="col.filterable !== false"
                v-model="filters[col.key]"
                size="small"
                :placeholder="col.filterPlaceholder || '搜索'"
                clearable
                @change="onFilterChange"
              />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="displayData.length === 0">
            <td
              :colspan="totalColumns"
              class="jo-table-empty"
            >
              {{ props.emptyText }}
            </td>
          </tr>
          <template v-for="(row, index) in displayData" :key="getRowKey(row, index)">
            <!-- 主行 -->
            <tr
              class="jo-table-row"
              :class="{ 'jo-table-selected': isRowSelected(row) }"
            >
              <!-- 扩展按钮 -->
              <td v-if="props.expandable" class="jo-table-td jo-table-expand">
                <t-button
                  size="small"
                  theme="default"
                  variant="text"
                  @click="toggleExpand(row)"
                >
                  <template #icon>
                    <svg v-if="!isExpanded(row)" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                      <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                    </svg>
                  </template>
                </t-button>
              </td>
              <!-- 序号 -->
              <td v-if="props.showIndex" class="jo-table-td jo-table-index">
                {{ index + 1 }}
              </td>
              <!-- 选择 -->
              <td v-if="props.selectable" class="jo-table-td jo-table-check">
                <t-checkbox
                  :checked="isRowSelected(row)"
                  @change="(checked: boolean) => onRowSelectChange(row, checked)"
                />
              </td>
              <!-- 数据单元格 -->
              <td
                v-for="col in displayColumns"
                :key="col.key"
                class="jo-table-td"
                :style="{ width: col.width, minWidth: col.minWidth }"
              >
                <slot
                  :name="`cell-${col.key}`"
                  :row="row"
                  :value="getCellValue(row, col)"
                  :index="index"
                >
                  {{ formatCellValue(getCellValue(row, col), col) }}
                </slot>
              </td>
            </tr>
            <!-- 扩展行 -->
            <tr v-if="props.expandable && isExpanded(row)" class="jo-table-expand-row">
              <td
                :colspan="totalColumns"
                class="jo-table-expand-cell"
              >
                <slot
                  name="expand"
                  :row="row"
                  :index="index"
                >
                </slot>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- 列设置弹窗 -->
    <t-dialog
      v-model:visible="showColumnSettings"
      header="列设置"
      width="500px"
      :footer="false"
    >
      <div class="jo-table-settings">
        <!-- 列显示/隐藏 -->
        <div class="settings-section">
          <div class="settings-title">显示列</div>
          <div class="settings-columns">
            <div
              v-for="col in props.columns"
              :key="col.key"
              class="settings-column-item"
            >
              <t-checkbox
                v-model="columnVisible[col.key]"
                :label="col.title"
              />
            </div>
          </div>
        </div>

        <!-- 列排序 -->
        <div class="settings-section">
          <div class="settings-title">列顺序（拖拽排序）</div>
          <div class="settings-sort-hint">提示：拖拽可调整列的显示顺序</div>
        </div>

        <!-- 操作按钮 -->
        <div class="settings-actions">
          <t-button theme="default" @click="showColumnSettings = false">关闭</t-button>
          <t-button theme="primary" @click="resetColumnSettings">重置</t-button>
        </div>
      </div>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// 列配置接口
export interface JoTableColumn {
  key: string
  title: string
  width?: string
  minWidth?: string
  sortable?: boolean
  filterable?: boolean
  filterPlaceholder?: string
  formatter?: (value: any, row: any) => string
  visible?: boolean // 是否可见，默认true
}

// 组件属性
interface Props {
  data: any[]
  columns: JoTableColumn[]
  rowKey?: string | ((row: any) => string)
  selectable?: boolean
  selectedKeys?: string[]
  filterable?: boolean // 是否可过滤
  showFilters?: boolean // 是否默认显示过滤行，默认false
  emptyText?: string
  maxHeight?: string
  expandable?: boolean // 是否可展开
  showIndex?: boolean // 是否显示序号列，默认true
}

const props = withDefaults(defineProps<Props>(), {
  selectable: false,
  filterable: true,
  showFilters: false,
  emptyText: '无数据',
  maxHeight: '520px',
  expandable: false,
  showIndex: true
})

// 事件
const emit = defineEmits<{
  'update:selectedKeys': [keys: string[]]
  'selectionChange': [keys: string[], rows: any[]]
  'sortChange': [field: string, order: 'asc' | 'desc']
  'expandChange': [row: any, expanded: boolean]
}>()

// 排序状态
const sortField = ref<string>('')
const sortOrder = ref<'asc' | 'desc'>('asc')

// 过滤状态
const filters = ref<Record<string, string>>({})
const showFilters = ref(props.showFilters)

// 列可见性
const columnVisible = ref<Record<string, boolean>>({})

// 列顺序
const columnOrder = ref<string[]>([])

// 展开的行
const expandedRows = ref<Set<string>>(new Set())

// 列设置弹窗
const showColumnSettings = ref(false)

// 初始化列设置
watch(() => props.columns, (cols) => {
  cols.forEach(col => {
    if (!(col.key in columnVisible.value)) {
      columnVisible.value[col.key] = col.visible !== false
    }
    if (!filters.value[col.key]) {
      filters.value[col.key] = ''
    }
  })
  if (columnOrder.value.length === 0) {
    columnOrder.value = cols.map(c => c.key)
  }
}, { immediate: true })

// 显示的列（按顺序且可见）
const displayColumns = computed(() => {
  const visibleCols = props.columns.filter(col => columnVisible.value[col.key] !== false)
  // 按 columnOrder 排序
  const orderMap = new Map(columnOrder.value.map((key, idx) => [key, idx]))
  return visibleCols.sort((a, b) => {
    const orderA = orderMap.get(a.key) ?? 999
    const orderB = orderMap.get(b.key) ?? 999
    return orderA - orderB
  })
})

// 计算总列数
const totalColumns = computed(() => {
  let count = displayColumns.value.length
  if (props.selectable) count++
  if (props.showIndex) count++
  if (props.expandable) count++
  return count
})

// 切换排序
function toggleSort(field: string) {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortOrder.value = 'asc'
  }
  emit('sortChange', sortField.value, sortOrder.value)
}

// 过滤变化
function onFilterChange() {
  // 由 computed 自动处理
}

// 切换过滤行显示
function toggleFilters() {
  showFilters.value = !showFilters.value
}

// 获取单元格值
function getCellValue(row: any, col: JoTableColumn): any {
  return row[col.key]
}

// 格式化单元格值
function formatCellValue(value: any, col: JoTableColumn): string {
  if (value === null || value === undefined) {
    return '-'
  }
  if (col.formatter) {
    return col.formatter(value, {})
  }
  return String(value)
}

// 获取行唯一键
function getRowKey(row: any, index: number): string {
  if (typeof props.rowKey === 'function') {
    return props.rowKey(row)
  }
  if (typeof props.rowKey === 'string') {
    return row[props.rowKey] || String(index)
  }
  return String(index)
}

// 过滤并排序后的数据
const displayData = computed(() => {
  let result = [...props.data]

  // 应用过滤（支持正则表达式）
  displayColumns.value.forEach(col => {
    const filterValue = filters.value[col.key]
    if (filterValue && col.filterable !== false) {
      try {
        const regex = new RegExp(filterValue, 'i')
        result = result.filter(row => {
          const val = getCellValue(row, col)
          return regex.test(String(val || ''))
        })
      } catch {
        const filter = filterValue.toLowerCase()
        result = result.filter(row => {
          const val = getCellValue(row, col)
          return String(val || '').toLowerCase().includes(filter)
        })
      }
    }
  })

  // 应用排序
  if (sortField.value) {
    const sortCol = displayColumns.value.find(c => c.key === sortField.value)
    if (sortCol) {
      result.sort((a, b) => {
        const aVal = getCellValue(a, sortCol)
        const bVal = getCellValue(b, sortCol)

        if (aVal === null || aVal === undefined || aVal === '') {
          return sortOrder.value === 'asc' ? -1 : 1
        }
        if (bVal === null || bVal === undefined || bVal === '') {
          return sortOrder.value === 'asc' ? 1 : -1
        }

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortOrder.value === 'asc' ? aVal - bVal : bVal - aVal
        }

        const aStr = String(aVal).toLowerCase()
        const bStr = String(bVal).toLowerCase()
        if (aStr < bStr) return sortOrder.value === 'asc' ? -1 : 1
        if (aStr > bStr) return sortOrder.value === 'asc' ? 1 : -1
        return 0
      })
    }
  }

  return result
})

// 选择相关计算
const selectedKeysSet = computed(() => new Set(props.selectedKeys || []))

const isAllSelected = computed(() => {
  if (displayData.value.length === 0) return false
  return displayData.value.every(row => isRowSelected(row))
})

const isIndeterminate = computed(() => {
  const selectedCount = displayData.value.filter(row => isRowSelected(row)).length
  return selectedCount > 0 && selectedCount < displayData.value.length
})

// 判断行是否被选中
function isRowSelected(row: any): boolean {
  const key = getRowKey(row, 0)
  return selectedKeysSet.value.has(key)
}

// 全选变化
function onSelectAllChange(checked: boolean) {
  const keys = checked
    ? displayData.value.map((row, index) => getRowKey(row, index))
    : []
  emit('update:selectedKeys', keys)
  emit('selectionChange', keys, checked ? displayData.value : [])
}

// 单行选择变化
function onRowSelectChange(row: any, checked: boolean) {
  const key = getRowKey(row, 0)
  const currentKeys = new Set(props.selectedKeys || [])

  if (checked) {
    currentKeys.add(key)
  } else {
    currentKeys.delete(key)
  }

  const keysArray = Array.from(currentKeys)
  const selectedRows = props.data.filter(r => {
    const k = getRowKey(r, 0)
    return currentKeys.has(k)
  })

  emit('update:selectedKeys', keysArray)
  emit('selectionChange', keysArray, selectedRows)
}

// 双击表头
function onHeaderDoubleClick(col: JoTableColumn, index: number) {
  showColumnSettings.value = true
}

// 切换展开状态
function toggleExpand(row: any) {
  const key = getRowKey(row, 0)
  const isExpanded = expandedRows.value.has(key)
  if (isExpanded) {
    expandedRows.value.delete(key)
  } else {
    expandedRows.value.add(key)
  }
  emit('expandChange', row, !isExpanded)
}

// 判断是否展开
function isExpanded(row: any): boolean {
  const key = getRowKey(row, 0)
  return expandedRows.value.has(key)
}

// 重置列设置
function resetColumnSettings() {
  props.columns.forEach(col => {
    columnVisible.value[col.key] = col.visible !== false
  })
  columnOrder.value = props.columns.map(c => c.key)
}

// 重置排序和过滤
function reset() {
  sortField.value = ''
  sortOrder.value = 'asc'
  Object.keys(filters.value).forEach(key => {
    filters.value[key] = ''
  })
  expandedRows.value.clear()
}

// 暴露方法
defineExpose({
  reset,
  toggleFilters,
  showFilters,
  toggleExpand,
  expandedRows
})
</script>

<style scoped>
/* ===== CSS 变量定义 - 可重写 ===== */
.jo-table-container {
  position: relative;
  /* 表头 */
  --jo-table-header-bg: #f8fafc;
  --jo-table-header-color: #374151;
  --jo-table-header-hover-bg: #e2e8f0;
  --jo-table-header-border: #e5e7eb;
  
  /* 过滤行 */
  --jo-table-filter-bg: #f8fafc;
  --jo-table-filter-border: #e5e7eb;
  --jo-table-filter-input-border: #e2e8f0;
  --jo-table-filter-input-focus-border: #3b82f6;
  
  /* 数据行 */
  --jo-table-cell-bg: #fff;
  --jo-table-cell-color: #475569;
  --jo-table-cell-border: #f1f5f9;
  --jo-table-cell-padding: 6px 10px;
  
  /* 斑马纹 */
  --jo-table-stripe-bg: #fafbfc;
  
  /* 行悬停 */
  --jo-table-hover-bg: #f1f5f9;
  
  /* 选中行 */
  --jo-table-selected-bg: #eff6ff;
  --jo-table-selected-color: #1e40af;
  
  /* 序号列 */
  --jo-table-index-color: #6b7280;
  --jo-table-index-width: 50px;
  
  /* 排序图标 */
  --jo-table-sort-icon-color: #3b82f6;
  
  /* 扩展行 */
  --jo-table-expand-bg: #f8fafc;
  --jo-table-expand-border: #e5e7eb;
  
  /* 空数据 */
  --jo-table-empty-color: #9ca3af;
  
  /* 滚动条 */
  --jo-table-scrollbar-track: #f1f5f9;
  --jo-table-scrollbar-thumb: #cbd5e1;
  --jo-table-scrollbar-thumb-hover: #94a3b8;
}

/* 滚动条 */
.jo-table-wrapper::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.jo-table-wrapper::-webkit-scrollbar-track {
  background: var(--jo-table-scrollbar-track);
}

.jo-table-wrapper::-webkit-scrollbar-thumb {
  background: var(--jo-table-scrollbar-thumb);
  border-radius: 3px;
}

.jo-table-wrapper::-webkit-scrollbar-thumb:hover {
  background: var(--jo-table-scrollbar-thumb-hover);
}

.jo-table-wrapper {
  overflow: auto;
}

.jo-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  min-width: 800px;
  background: var(--jo-table-cell-bg);
}

/* 表头样式 - 紧凑 */
.jo-table th {
  background: var(--jo-table-header-bg);
  font-weight: 600;
  color: var(--jo-table-header-color);
  padding: 8px 10px;
  text-align: left;
  border-bottom: 1px solid var(--jo-table-header-border);
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 10;
}

/* 可排序表头 */
.jo-table-sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
}

.jo-table-sortable:hover {
  background: var(--jo-table-header-hover-bg);
}

.jo-table-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}

.jo-table-sort-icon {
  font-size: 10px;
  color: var(--jo-table-sort-icon-color);
  margin-left: auto;
}

/* 过滤行 - 超紧凑细长 */
.jo-table-filter-row th {
  padding: 0;
  height: 22px;
  background: var(--jo-table-filter-bg);
  border-bottom: 1px solid var(--jo-table-filter-border);
  top: 28px;
  z-index: 5;
}

.jo-table-filter-row :deep(.t-input) {
  width: 100%;
  height: 100%;
}

.jo-table-filter-row :deep(.t-input__wrap) {
  width: 100%;
  height: 100%;
}

.jo-table-filter-row :deep(.t-input__inner) {
  height: 100% !important;
  min-height: 20px;
  border-radius: 0;
  padding: 0 4px;
  font-size: 11px;
  border: none;
  background: transparent;
}

.jo-table-filter-row :deep(.t-input__inner:focus) {
  background: #fff;
  box-shadow: inset 0 0 0 1px var(--jo-table-filter-input-focus-border);
}

.jo-table-filter-row :deep(.t-input__suffix) {
  right: 2px;
}

/* 数据行 - 紧凑 */
.jo-table td {
  padding: var(--jo-table-cell-padding);
  text-align: left;
  border-bottom: 1px solid var(--jo-table-cell-border);
  white-space: nowrap;
  color: var(--jo-table-cell-color);
  background: var(--jo-table-cell-bg);
}

/* 斑马纹 - 正确的 nth-child 选择 */
.jo-table tbody tr.jo-table-row:nth-child(even) td {
  background: var(--jo-table-stripe-bg);
}

/* 行悬停 */
.jo-table tbody tr.jo-table-row:hover td {
  background: var(--jo-table-hover-bg);
}

/* 选中行 */
.jo-table-selected td {
  background: var(--jo-table-selected-bg) !important;
  color: var(--jo-table-selected-color);
}

/* 序号列 */
.jo-table-index {
  width: var(--jo-table-index-width);
  text-align: center;
  color: var(--jo-table-index-color);
  font-weight: 500;
}

/* 复选框列 */
.jo-table-check {
  width: 40px;
  text-align: center;
  vertical-align: middle;
  padding-left: 10px;
  padding-right: 6px;
}

.jo-table-check :deep(.t-checkbox) {
  display: inline-flex;
}

/* 扩展列 */
.jo-table-expand-header {
  width: 40px;
  text-align: center;
  padding: 0;
}

.jo-table-expand {
  width: 40px;
  text-align: center;
  padding: 0;
}

.jo-table-expand :deep(.t-button) {
  min-width: 24px;
  width: 24px;
  height: 24px;
  padding: 0;
}

/* 扩展行 */
.jo-table-expand-row {
  background: var(--jo-table-expand-bg) !important;
}

.jo-table-expand-row td {
  background: var(--jo-table-expand-bg) !important;
  padding: 12px 16px;
  border-bottom: 1px solid var(--jo-table-expand-border);
  white-space: normal;
}

/* 空数据 */
.jo-table-empty {
  text-align: center;
  color: var(--jo-table-empty-color);
  font-style: italic;
  padding: 20px;
  background: var(--jo-table-cell-bg);
}

/* 列设置弹窗 */
.jo-table-settings {
  padding: 8px;
}

.settings-section {
  margin-bottom: 20px;
}

.settings-title {
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
  font-size: 14px;
}

.settings-columns {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.settings-column-item {
  padding: 4px;
}

.settings-sort-hint {
  color: #6b7280;
  font-size: 12px;
  padding: 8px;
  background: #f3f4f6;
  border-radius: 4px;
}

.settings-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}
</style>
