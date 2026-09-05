<template>
  <div :class="['jo-search-panel-wrapper', { 'is-collapsed': collapsed, 'is-collapsible': collapsible }, `size-${size}`]">
    <!-- 切换头部 -->
    <div v-if="collapsible" class="jo-search-header" @click="toggleCollapse">
      <div class="jo-search-header-left" @click.stop>
        <slot name="header-left">
          <div class="jo-search-shortcuts">
            <span class="shortcuts-label">{{ searchText }}:</span>
            <span
              v-for="shortcut in dateShortcuts"
              :key="shortcut"
              class="shortcut-item"
              @click="$emit('shortcut-click', shortcut)"
            >
              {{ shortcut }}
            </span>
            <span v-if="customPresets.length > 0" class="shortcut-divider">|</span>
            <span
              v-for="(preset, index) in customPresets"
              :key="preset.name"
              class="shortcut-item custom-preset"
            >
              <span class="preset-name-click" @click="applyPreset(preset)">{{ preset.name }}</span>
              <svg class="delete-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" @click.stop="deletePreset(index)">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </span>
          </div>
        </slot>
      </div>
      <div class="jo-search-header-right" @click.stop>
        <span v-if="storeKey" class="shortcut-item save-preset-link" @click="savePreset">
          {{ savePresetLinkText }}
        </span>
        <div class="jo-search-toggle-trigger" @click="toggleCollapse">
          <svg :class="['toggle-icon', { 'is-collapsed': collapsed }]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
          <span>{{ collapseText }}</span>
        </div>
      </div>
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
                :placeholder="field.startPlaceholder || ''"
                :size="size"
                format="YYYY-MM-DD"
                :enable-time-picker="false"
                @change="onChange"
              />
              <span class="jo-search-date-separator">-</span>
              <t-date-picker
                v-model="values[field.key + '_end']"
                :placeholder="field.endPlaceholder || ''"
                :size="size"
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
              :placeholder="field.placeholder || ''"
              :size="size"
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
              :placeholder="field.placeholder || ''"
              :size="size"
              clearable
              @change="onChange"
            />
          </div>

          <!-- 数字输入 -->
          <div v-else-if="field.type === 'number'" class="jo-search-field jo-search-field-text">
            <span class="jo-search-label">{{ field.label }}</span>
            <t-input-number
              v-model="values[field.key]"
              :placeholder="field.placeholder || ''"
              :size="size"
              clearable
              @change="onChange"
            />
          </div>

          <!-- 文本输入（默认） -->
          <div v-else class="jo-search-field jo-search-field-text">
            <span class="jo-search-label">{{ field.label }}</span>
            <t-input
              v-model="values[field.key]"
              :placeholder="field.placeholder || ''"
              :size="size"
              clearable
              @change="onChange"
            />
          </div>
        </template>

        <!-- 操作按钮 -->
        <div class="jo-search-actions">
          <t-button theme="primary" :size="size" @click="onSearch">{{ searchText }}</t-button>
          <t-button theme="default" :size="size" @click="onReset">{{ resetText }}</t-button>
        </div>
      </div>
    </div>
  </div>

  <!-- Custom save preset dialog modal -->
  <div v-if="showSaveDialog" class="save-preset-modal-backdrop" @click="showSaveDialog = false">
    <div class="save-preset-modal" @click.stop>
      <div class="save-preset-modal-header">
        <h3>{{ isEn ? 'Save Search Preset' : '保存常用查询' }}</h3>
        <button class="close-btn" @click="showSaveDialog = false">&times;</button>
      </div>
      <div class="save-preset-modal-body">
        <label>{{ isEn ? 'Preset Name' : '请输入过滤条件名称：' }}</label>
        <t-input
          v-model="newPresetName"
          :placeholder="isEn ? 'e.g. My Filter' : '例如：常用单号、今日传输'"
          size="medium"
          autofocus
          @keyup.enter="confirmSavePreset"
        />
        <div v-if="saveErrorMsg" class="error-msg">{{ saveErrorMsg }}</div>
      </div>
      <div class="save-preset-modal-footer">
        <t-button theme="default" variant="outline" size="medium" @click="showSaveDialog = false">
          {{ isEn ? 'Cancel' : '取消' }}
        </t-button>
        <t-button theme="primary" size="medium" :disabled="!newPresetName.trim()" @click="confirmSavePreset">
          {{ isEn ? 'Confirm' : '确定' }}
        </t-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'

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
  size?: 'small' | 'medium' // 整体大小，默认'small'
  dateShortcuts?: string[] // 默认快捷过滤
  storeKey?: string // 用于本地存储自定义快捷过滤的 key
}

const props = withDefaults(defineProps<Props>(), {
  searchText: '查询',
  resetText: '重置',
  collapsible: false,
  collapsed: false,
  collapseText: '搜索',
  size: 'small',
  dateShortcuts: () => [],
  storeKey: ''
})

const emit = defineEmits<{
  'update:modelValue': [values: Record<string, any>]
  'search': [values: Record<string, any>]
  'reset': []
  'shortcut-click': [shortcut: string]
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

const customPresets = ref<{ name: string; values: Record<string, any> }[]>([])

const savePresetText = computed(() => {
  const isEn = props.searchText && /[a-zA-Z]/.test(props.searchText)
  return isEn ? 'Save Filter' : '保存条件'
})

const savePresetLinkText = computed(() => {
  const isEn = props.searchText && /[a-zA-Z]/.test(props.searchText)
  return isEn ? '+ Save' : '+ 保存条件'
})

function loadPresets() {
  if (!props.storeKey) return
  try {
    const saved = localStorage.getItem(props.storeKey)
    if (saved) {
      customPresets.value = JSON.parse(saved)
    }
  } catch (e) {
    console.error('Failed to load presets:', e)
  }
}

const showSaveDialog = ref(false)
const newPresetName = ref('')
const saveErrorMsg = ref('')

const isEn = computed(() => {
  return props.searchText && /[a-zA-Z]/.test(props.searchText)
})

function savePreset() {
  if (!props.storeKey) return
  newPresetName.value = ''
  saveErrorMsg.value = ''
  showSaveDialog.value = true
}

function confirmSavePreset() {
  const trimmed = newPresetName.value.trim()
  const msgEmptyName = isEn.value ? 'Filter preset name cannot be empty.' : '名称不能为空。'
  const msgDuplicateName = isEn.value ? 'A preset with this name already exists.' : '该名称已存在。'
  
  if (!trimmed) {
    saveErrorMsg.value = msgEmptyName
    return
  }
  
  if (customPresets.value.some(p => p.name === trimmed)) {
    saveErrorMsg.value = msgDuplicateName
    return
  }
  
  // Clone current values
  const presetValues = { ...values }
  
  customPresets.value.push({
    name: trimmed,
    values: presetValues
  })
  
  try {
    localStorage.setItem(props.storeKey, JSON.stringify(customPresets.value))
  } catch (e) {
    console.error('Failed to save preset:', e)
  }
  
  showSaveDialog.value = false
}

function deletePreset(index: number) {
  customPresets.value.splice(index, 1)
  if (!props.storeKey) return
  try {
    localStorage.setItem(props.storeKey, JSON.stringify(customPresets.value))
  } catch (e) {
    console.error('Failed to delete preset:', e)
  }
}

function applyPreset(preset: { name: string; values: Record<string, any> }) {
  // Set all values in form to match preset values, clearing fields not in the preset
  displayFields.value.forEach(field => {
    if (field.type === 'date-range') {
      values[field.key + '_start'] = preset.values[field.key + '_start'] || ''
      values[field.key + '_end'] = preset.values[field.key + '_end'] || ''
    } else {
      values[field.key] = preset.values[field.key] !== undefined ? preset.values[field.key] : (field.type === 'number' ? undefined : '')
    }
  })
  
  // 立即触发搜索
  onSearch()
}

onMounted(() => {
  loadPresets()
})

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
  border: 1px solid var(--border-glass, #e6ecf5);
  border-radius: 8px;
  background: var(--card-bg, rgba(255, 255, 255, 0.98));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: var(--shadow-card, 0 1px 3px rgba(0, 0, 0, 0.04));
  transition: all 0.3s ease;
  overflow: hidden;
  box-sizing: border-box;
}

.jo-search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  user-select: none;
  border-bottom: 1px solid transparent;
  transition: border-color var(--transition-fast, 0.15s) ease;
}

.jo-search-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

/* 展开时，在头部下方显示分割线 */
.jo-search-panel-wrapper:not(.is-collapsed) .jo-search-header {
  border-bottom: 1px solid var(--border-glass, #e6ecf5);
}

.jo-search-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  flex-wrap: wrap;
}

.jo-search-shortcuts {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.shortcuts-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-dim, #9ca3af);
  margin-right: 4px;
}

.shortcut-item {
  font-size: 12px;
  color: var(--text-dim, #9ca3af);
  cursor: pointer;
  padding: 0 4px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
  user-select: none;
}

.shortcut-item:hover {
  color: var(--color-primary, #ff7828);
  text-decoration: underline;
}

.save-preset-link {
  color: var(--color-primary, #ff7828) !important;
  font-weight: 500;
  padding: 0 4px;
}

.save-preset-link:hover {
  text-decoration: underline;
  opacity: 0.8;
}

.jo-search-header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.shortcut-divider {
  color: var(--text-dim, #4b5563);
  font-size: 12px;
  margin: 0 4px;
  user-select: none;
}

.shortcut-item.custom-preset {
  color: var(--color-primary, #ff7828);
}

.shortcut-item.custom-preset:hover {
  text-decoration: underline;
}

.preset-name-click {
  cursor: pointer;
}

.shortcut-item .delete-icon {
  width: 12px;
  height: 12px;
  stroke: currentColor;
  stroke-width: 2.5;
  cursor: pointer;
  border-radius: 50%;
  padding: 1px;
  transition: background-color 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.shortcut-item .delete-icon:hover {
  background-color: rgba(255, 0, 0, 0.2);
  color: var(--color-danger, #ef4444);
}

.jo-search-header-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main, #e2e8f0);
}

.search-icon {
  width: 14px;
  height: 14px;
  stroke: currentColor;
}

.jo-search-toggle-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-dim, #9ca3af);
  font-weight: 500;
  transition: color var(--transition-fast, 0.15s) ease;
}

.jo-search-toggle-trigger:hover {
  color: var(--color-primary, #ff7828);
}

.jo-search-toggle-trigger .toggle-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.jo-search-toggle-trigger .toggle-icon.is-collapsed {
  transform: rotate(180deg);
}

.jo-search-panel {
  padding: 16px 16px;
  width: 100%;
  box-sizing: border-box;
}

/* 核心布局：网格系统 */
.jo-search-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 0;
  width: 100%;
}

.jo-search-field {
  display: flex;
  align-items: center;
  width: 25%;
  padding-right: 24px;
  box-sizing: border-box;
}

.jo-search-field-date {
  width: 50%;
}

.jo-search-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-dim, #4b5563);
  width: 80px;
  text-align: right;
  flex-shrink: 0;
  margin-right: 8px;
  white-space: nowrap;
}

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
  color: var(--text-disabled, #9ca3af);
  font-size: 12px;
}

.jo-search-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1; 
  padding-right: 24px;
  gap: 8px;
  margin-left: auto;
  box-sizing: border-box;
}

:deep(.t-button) {
  min-width: 72px;
  font-size: 13px;
  padding: 4px 12px;
}

/* Compact styling for small size */
.jo-search-panel-wrapper.size-small {
  border-radius: 6px;
}

.jo-search-panel-wrapper.size-small .jo-search-header {
  padding: 6px 12px;
}

.jo-search-panel-wrapper.size-small .jo-search-panel {
  padding: 10px 12px;
}

.jo-search-panel-wrapper.size-small .jo-search-grid {
  gap: 8px 0;
}

.jo-search-panel-wrapper.size-small .jo-search-field {
  padding-right: 16px;
}

.jo-search-panel-wrapper.size-small .jo-search-label {
  font-size: 12px;
  width: 70px;
  margin-right: 6px;
}

.jo-search-panel-wrapper.size-small :deep(.t-button) {
  min-width: 60px;
  font-size: 12px;
  padding: 2px 10px;
}

.jo-search-panel-wrapper.size-small .jo-search-header-title {
  font-size: 12px;
}

.jo-search-panel-wrapper.size-small .jo-search-toggle-trigger {
  font-size: 12px;
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

/* Custom save preset dialog modal styles */
.save-preset-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.save-preset-modal {
  width: 400px;
  background: var(--card-bg, rgba(30, 30, 35, 0.95));
  border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.15));
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: modal-fade-in 0.2s ease-out;
  box-sizing: border-box;
}

@keyframes modal-fade-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.save-preset-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
  padding-bottom: 10px;
}

.save-preset-modal-header h3 {
  margin: 0;
  font-size: 16px;
  color: var(--text-main, #e2e8f0);
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--text-dim, #9ca3af);
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  color: var(--text-main, #e2e8f0);
}

.save-preset-modal-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.save-preset-modal-body label {
  font-size: 13px;
  color: var(--text-dim, #9ca3af);
  text-align: left;
}

.error-msg {
  color: var(--color-danger, #ef4444);
  font-size: 12px;
  margin-top: 4px;
  text-align: left;
}

.save-preset-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
  padding-top: 12px;
}
</style>
