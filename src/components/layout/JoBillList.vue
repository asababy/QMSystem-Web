<template>
  <div class="page">
    <div class="card">
      <div class="title-row">
        <div>
          <h1>{{ title }}</h1>
          <div class="subtitle" v-if="subtitle">{{ subtitle }}</div>
        </div>
        <div class="title-actions">
          <slot name="title-actions">
            <HomeNavButton />
          </slot>
          <div v-if="statusText" :class="['status-badge', hasError ? 'status-error' : 'status-ok']">
            {{ statusText }}
          </div>
        </div>
      </div>

      <div class="main-content-row" v-if="searchFields && searchFields.length > 0">
        <div class="filter-section">
          <JoSearchPanel ref="searchPanelRef" :fields="searchFields"
            :search-text="searchText || t('common.query', '查询')" :reset-text="resetText || t('common.reset', '重置')"
            :model-value="searchValues" @update:modelValue="onUpdateSearchValues" :collapsible="true" :collapsed="false"
            :date-shortcuts="dateShortcuts" :store-key="`bill-list-presets-${title}`"
            @search="onSearch" @reset="$emit('reset')" @shortcut-click="$emit('date-shortcut', $event)" />
        </div>
      </div>

      <div class="action-section" v-if="$slots.actions">
        <div class="action-bar">
          <slot name="actions"></slot>
        </div>
      </div>

      <div class="status-bar" v-if="message || totalRecords !== undefined">
        <div v-if="message">{{ message }}</div>
        <div v-if="totalRecords !== undefined">{{ t('common.allRecords', { count: totalRecords }, `共 ${totalRecords}
          条记录`) }}</div>
      </div>

      <slot name="before-table"></slot>

      <!-- 优先使用内置的 JoTable，如果未配置 tableColumns，则退化使用旧的 #table slot -->
      <div v-if="tableColumns && tableColumns.length > 0" class="jo-bill-table-wrapper">
        <JoTable ref="tableRef" :data="tableData" :columns="tableColumns" :row-key="tableRowKey"
          :selectable="tableSelectable" :selected-keys="tableSelectedKeys" :filterable="tableFilterable"
          :show-filters="tableShowFilters" :expandable="tableExpandable" :show-index="tableShowIndex"
          :disabled-row="tableDisabledRow" :empty-text="tableEmptyText" :max-height="tableMaxHeight"
          @update:selectedKeys="onUpdateTableSelectedKeys" @selectionChange="onTableSelectionChange"
          @sortChange="onTableSortChange" @expandChange="onTableExpandChange">
          <template v-for="(_, name) in $slots" v-slot:[name]="slotData">
            <slot v-if="!isLayoutSlot(name)" :name="name" v-bind="slotData || {}"></slot>
          </template>
        </JoTable>
      </div>
      <slot name="table" v-else></slot>

      <slot name="after-table"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import JoSearchPanel from '@/components/basic/search-panel/JoSearchPanel.vue'
import HomeNavButton from '@/components/layout/HomeNavButton.vue'
import JoTable from '@/components/basic/table/JoTable.vue'
import type { JoTableColumn } from '@/components/basic/table/JoTable.vue'

const { t } = useI18n()

interface Props {
  title: string
  subtitle?: string
  statusText?: string
  hasError?: boolean
  message?: string
  totalRecords?: number
  searchFields?: any[]
  searchValues?: Record<string, any>
  searchText?: string
  resetText?: string
  dateShortcuts?: string[]
  // --- 表格属性 ---
  tableData?: any[]
  tableColumns?: JoTableColumn[]
  tableRowKey?: string | ((row: any) => string)
  tableSelectable?: boolean
  tableSelectedKeys?: string[]
  tableFilterable?: boolean
  tableShowFilters?: boolean
  tableExpandable?: boolean
  tableShowIndex?: boolean
  tableDisabledRow?: (row: any) => boolean
  tableEmptyText?: string
  tableMaxHeight?: string
}

const props = withDefaults(defineProps<Props>(), {
  searchFields: () => [],
  searchValues: () => ({}),
  dateShortcuts: () => [],
  tableData: () => [],
  tableColumns: () => [],
  tableSelectable: false,
  tableFilterable: true,
  tableShowFilters: false,
  tableExpandable: false,
  tableShowIndex: true,
  tableEmptyText: '暂无数据',
  tableMaxHeight: '520px'
})

const emit = defineEmits<{
  'update:searchValues': [values: Record<string, any>]
  'search': [values: Record<string, any>]
  'reset': []
  'date-shortcut': [shortcut: string]
  // --- 表格事件 ---
  'update:tableSelectedKeys': [keys: string[]]
  'tableSelectionChange': [keys: string[], rows: any[]]
  'tableSortChange': [field: string, order: 'asc' | 'desc']
  'tableExpandChange': [row: any, expanded: boolean]
}>()

const searchPanelRef = ref<InstanceType<typeof JoSearchPanel>>()
const tableRef = ref<InstanceType<typeof JoTable>>()

// 判断是否为布局插槽
const layoutSlots = ['title-actions', 'actions', 'before-table', 'table', 'after-table']
function isLayoutSlot(name: string | number | symbol) {
  return layoutSlots.includes(name as string)
}

function onUpdateSearchValues(values: Record<string, any>) {
  emit('update:searchValues', values)
}

function onSearch(values: Record<string, any>) {
  emit('search', values)
}

function setValues(values: Record<string, any>) {
  searchPanelRef.value?.setValues(values)
}

// 表格事件转发
function onUpdateTableSelectedKeys(keys: string[]) {
  emit('update:tableSelectedKeys', keys)
}

function onTableSelectionChange(keys: string[], rows: any[]) {
  emit('tableSelectionChange', keys, rows)
}

function onTableSortChange(field: string, order: 'asc' | 'desc') {
  emit('tableSortChange', field, order)
}

function onTableExpandChange(row: any, expanded: boolean) {
  emit('tableExpandChange', row, expanded)
}

defineExpose({
  searchPanelRef,
  tableRef,
  setValues
})
</script>

<style scoped lang="scss">
.page {
  width: 100%;
  min-width: 0;
  min-height: 100%;
  padding: 12px;
  box-sizing: border-box;
}

.card {
  border-radius: var(--radius-lg, 12px);
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h1 {
    font-size: var(--font-size-xl, 20px);
    font-weight: 600;
    color: var(--text-main, #111827);
    margin: 0;
  }

  .subtitle {
    font-size: var(--font-size-sm, 14px);
    color: var(--text-dim, #6b7280);
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
  border-radius: var(--radius-md, 6px);
  font-size: var(--font-size-sm, 14px);
  font-weight: 500;

  &.status-ok {
    background: var(--color-success-light, #d1fae5);
    color: var(--color-success-dark, #065f46);
  }

  &.status-error {
    background: var(--color-danger-light, #fee2e2);
    color: var(--color-danger-dark, #991b1b);
  }
}

.main-content-row {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.filter-section {
  width: 100%;
  margin-bottom: 4px;
}

.action-section {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 4px;
  gap: 16px;
  padding: 4px 0;
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

.action-bar {
  display: flex;
  gap: 8px;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--bg-secondary, #f3f4f6);
  background-image: linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%);
  border-radius: 8px 8px 0 0;
  font-size: var(--font-size-sm, 14px);
  color: var(--text-dim, #6b7280);
}
</style>
