<template>
  <div class="jo-search-panel-wrapper">
    <!-- 切换按钮 -->
    <div v-if="collapsible" class="jo-search-toggle-header">
      <button @click="toggleCollapse" class="jo-search-toggle-btn">
        <svg :class="['toggle-icon', { 'is-collapsed': collapsed }]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
        {{ collapseText }}
      </button>
    </div>
    
    <!-- 搜索面板内容 -->
    <div v-show="!collapsed" class="jo-search-panel">
      <div class="jo-search-grid">
        <template v-for="field in displayFields" :key="field.key">
          <!-- 日期区间 -->
          <div v-if="field.type === 'date-range'" class="jo-search-field jo-search-field-date">
            <span class="jo-search-label">{{ field.label }}</span>
            <div class="jo-search-date-range">
              <t-date-picker
                v-model="values[field.key + '_start']"
                :placeholder="field.startPlaceholder || '开始日期'"
                size="medium"
                format="YYYY-MM-DD"
                :enable-time-picker="false"
                @change="onChange"
              />
              <span class="jo-search-date-separator">-</span>
              <t-date-picker
                v-model="values[field.key + '_end']"
                :placeholder="field.endPlaceholder || '结束日期'"
                size="medium"
                format="YYYY-MM-DD"
                :enable-time-picker="false"
                @change="onChange"
              />
            </div>
          </div>

          <!-- 单个日期 -->
          <div v-else-if="field.type === 'date'" class="jo-search-field jo-search-field-date">
            <span class="jo-search-label">{{ field.label }}</span>
            <t-date-picker
              v-model="values[field.key]"
              :placeholder="field.placeholder || '请选择'"
              size="medium"
              format="YYYY-MM-DD"
              :enable-time-picker="field.enableTimePicker || false"
              @change="onChange"
            />
          </div>

          <!-- 下拉选择 -->
          <div v-else-if="field.type === 'select'" class="jo-search-field jo-search-field-text">
            <span class="jo-search-label">{{ field.label }}</span>
            <t-select
              v-model="values[field.key]"
              :options="field.options || []"
              :placeholder="field.placeholder || '请选择'"
              size="medium"
              clearable
              @change="onChange"
            />
          </div>

          <!-- 数字输入 -->
          <div v-else-if="field.type === 'number'" class="jo-search-field jo-search-field-text">
            <span class="jo-search-label">{{ field.label }}</span>
            <t-input-number
              v-model="values[field.key]"
              :placeholder="field.placeholder || '请输入'"
              size="medium"
              clearable
              @change="onChange"
            />
          </div>

          <!-- 文本输入（默认） -->
          <div v-else class="jo-search-field jo-search-field-text">
            <span class="jo-search-label">{{ field.label }}</span>
            <t-input
              v-model="values[field.key]"
              :placeholder="field.placeholder || '请输入'"
              size="medium"
              clearable
              @change="onChange"
            />
          </div>
        </template>

        <!-- 操作按钮 -->
        <div class="jo-search-actions">
          <t-button theme="primary" size="small" @click="onSearch">{{ searchText }}</t-button>
          <t-button theme="default" size="small" @click="onReset">{{ resetText }}</t-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'

// 搜索字段配置
export interface SearchField {
  key: string
  label: string
  type?: 'text' | 'date' | 'date-range' | 'number' | 'select'
  placeholder?: string
  searchable?: boolean // 是否显示搜索框，默认true
  // 日期区间专用
  startPlaceholder?: string
  endPlaceholder?: string
  enableTimePicker?: boolean
  // 下拉专用
  options?: { label: string; value: any }[]
}

interface Props {
  fields: SearchField[]
  modelValue?: Record<string, any>
  searchText?: string
  resetText?: string
  collapsible?: boolean // 是否可折叠，默认false
  collapsed?: boolean // 是否默认折叠，默认false
  collapseText?: string // 折叠按钮文字，默认"搜索"
}

const props = withDefaults(defineProps<Props>(), {
  searchText: '查询',
  resetText: '重置',
  collapsible: false,
  collapsed: false,
  collapseText: '搜索'
})

const emit = defineEmits<{
  'update:modelValue': [values: Record<string, any>]
  'search': [values: Record<string, any>]
  'reset': []
}>()

// 只显示 searchable !== false 的字段
const displayFields = computed(() => props.fields.filter(f => f.searchable !== false))

// 内部搜索值
const values = reactive<Record<string, any>>({})

// 折叠状态
const collapsed = ref(props.collapsed)

// 切换折叠状态
function toggleCollapse() {
  collapsed.value = !collapsed.value
}

// 初始化默认值
function initValues() {
  displayFields.value.forEach(field => {
    if (field.type === 'date-range') {
      values[field.key + '_start'] = props.modelValue?.[field.key + '_start'] || ''
      values[field.key + '_end'] = props.modelValue?.[field.key + '_end'] || ''
    } else {
      values[field.key] = props.modelValue?.[field.key] || (field.type === 'number' ? undefined : '')
    }
  })
}

initValues()

// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    Object.assign(values, newVal)
  }
}, { deep: true })

// 监听内部值变化，同步到外部
watch(values, (newVal) => {
  emit('update:modelValue', { ...newVal })
}, { deep: true })

function onChange() {
  // 值变化时自动更新 v-model
}

function onSearch() {
  emit('search', { ...values })
}

function onReset() {
  displayFields.value.forEach(field => {
    if (field.type === 'date-range') {
      values[field.key + '_start'] = ''
      values[field.key + '_end'] = ''
    } else if (field.type === 'number') {
      values[field.key] = undefined
    } else {
      values[field.key] = ''
    }
  })
  emit('reset')
  emit('search', { ...values })
}

// 获取当前搜索值（用于外部读取）
function getValues() {
  return { ...values }
}

// 设置搜索值
function setValues(newValues: Record<string, any>) {
  Object.assign(values, newValues)
}

defineExpose({
  getValues,
  setValues,
  reset: onReset,
  search: onSearch,
  toggleCollapse,
  collapsed
})
</script>

<style scoped>
.jo-search-panel-wrapper {
  position: relative;
  width: 100%;
}

.jo-search-panel {
  padding: 16px 16px;
  border: 1px solid #e6ecf5;
  border-radius: 8px;
  background: linear-gradient(180deg, rgba(247, 250, 255, 0.95), rgba(255, 255, 255, 0.98));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
}

.jo-search-toggle-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: -16px;
  position: relative;
  z-index: 10;
  padding-right: 16px; /* 完美对齐大面板的 padding */
}

.jo-search-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  padding: 4px 12px;
  height: auto;
  min-height: 24px;
  background: #f7faff;
  border: 1px solid #e6ecf5;
  border-radius: 4px;
  color: #1976d2;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  line-height: 1.5;
  position: relative;
  z-index: 11;
}

.jo-search-toggle-btn .toggle-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.jo-search-toggle-btn .toggle-icon.is-collapsed {
  transform: rotate(180deg);
}

.jo-search-toggle-btn:hover {
  border-color: rgb(113, 177, 240);
  box-shadow: 0 2px 6px rgba(25, 118, 210, 0.15);
}

/* 核心布局重构：严格等分网格系统保证上下换行时绝对完美垂直对齐 */
.jo-search-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 0; /* 水平间距由列内的 padding 控制，以保证右侧边缘极其精准 */
  width: 100%;
}

.jo-search-field {
  display: flex;
  align-items: center;
  width: 25%; /* 改为 25% 防止占位过大导致文本框过长 */
  padding-right: 24px;
  box-sizing: border-box;
}

.jo-search-field-date {
  width: 50%; /* 日期类型恰好跨 2列 */
}

.jo-search-label {
  font-size: 13px;
  font-weight: 500;
  color: #4b5563;
  width: 80px;
  text-align: right;
  flex-shrink: 0;
  margin-right: 8px;
  white-space: nowrap;
}

/* 强制内容填满格子的剩余区域，达到准确坐标 */
.jo-search-field > :not(.jo-search-label) {
  flex: 1;
  min-width: 0; 
}

.jo-search-date-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.jo-search-date-separator {
  color: #9ca3af;
  font-size: 12px;
}

.jo-search-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1; 
  padding-right: 24px;
  gap: 8px;
  margin-left: auto; /* 保证这组按钮永远在当前行的最右侧 */
  box-sizing: border-box;
}

:deep(.t-button) {
  min-width: 72px;
  font-size: 13px;
  padding: 4px 12px;
}
:deep(.t-button--theme-primary) {
  --td-brand-color: #1976d2;
  --td-brand-color-hover: #1565c0;
  --td-brand-color-active: #0d47a1;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .jo-search-field { width: 33.333%; }
  .jo-search-field-date { width: 66.666%; }
}

@media (max-width: 768px) {
  .jo-search-panel {
    padding: 16px;
  }
  .jo-search-grid {
    gap: 12px 0;
  }
  .jo-search-field { width: 100%; padding-right: 0; }
  .jo-search-field-date { width: 100%; }
  .jo-search-actions { width: 100%; padding-right: 0; justify-content: flex-end; margin-top: 4px; }
  .jo-search-label { width: 60px; }
}
</style>
