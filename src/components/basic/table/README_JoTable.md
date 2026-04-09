# JoTable 表格组件

一个功能丰富的 Vue 3 表格组件，支持排序、过滤、选择、扩展行等功能。

## 特性

- ✅ **序号列** - 自动显示行号
- ✅ **单选/多选** - 支持行选择（Checkbox）
- ✅ **列排序** - 点击表头排序，支持升序/降序
- ✅ **列过滤** - 支持正则表达式搜索
- ✅ **扩展行** - 可展开显示详情
- ✅ **列设置** - 双击表头设置列显示/隐藏和顺序
- ✅ **斑马纹** - 隔行变色
- ✅ **紧凑型设计** - 适合数据密集型场景

## 使用方式

```vue
<script setup lang="ts">
import JoTable from '@/components/basic/table/JoTable.vue'
import type { JoTableColumn } from '@/components/basic/table/JoTable.vue'

const columns: JoTableColumn[] = [
  { key: 'name', title: '名称', width: '150px' },
  { key: 'age', title: '年龄', sortable: true },
  { key: 'address', title: '地址', filterable: true }
]

const data = [
  { name: '张三', age: 18, address: '北京' },
  { name: '李四', age: 20, address: '上海' }
]
</script>

<template>
  <JoTable :data="data" :columns="columns" />
</template>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `data` | `any[]` | `[]` | 表格数据 |
| `columns` | `JoTableColumn[]` | `[]` | 列配置 |
| `rowKey` | `string \| function` | - | 行唯一键 |
| `selectable` | `boolean` | `false` | 是否可选择 |
| `selectedKeys` | `string[]` | `[]` | 选中行的 keys |
| `filterable` | `boolean` | `true` | 是否可过滤 |
| `expandable` | `boolean` | `false` | 是否可展开 |
| `showIndex` | `boolean` | `true` | 是否显示序号列 |
| `emptyText` | `string` | `'无数据'` | 空数据提示 |
| `maxHeight` | `string` | `'520px'` | 最大高度 |

## JoTableColumn 配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `key` | `string` | - | 数据字段名 |
| `title` | `string` | - | 列标题 |
| `width` | `string` | - | 列宽 |
| `minWidth` | `string` | - | 最小宽度 |
| `sortable` | `boolean` | `true` | 是否可排序 |
| `filterable` | `boolean` | `true` | 是否可过滤 |
| `filterPlaceholder` | `string` | `'搜索'` | 搜索框占位符 |
| `formatter` | `function` | - | 格式化函数 |
| `visible` | `boolean` | `true` | 是否可见 |

## 事件

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:selectedKeys` | `keys: string[]` | 选中 keys 变化 |
| `selectionChange` | `keys, rows` | 选择变化 |
| `sortChange` | `field, order` | 排序变化 |
| `expandChange` | `row, expanded` | 展开变化 |

## 方法 (Expose)

| 方法 | 说明 |
|------|------|
| `reset()` | 重置排序和过滤 |
| `toggleFilters()` | 切换过滤行显示 |
| `toggleExpand(row)` | 切换行展开 |

## 自定义主题（CSS 变量）

JoTable 支持通过 CSS 变量自定义颜色，所有颜色都定义在 `.jo-table-container` 上：

### 使用方式

```vue
<style scoped>
/* 方式1：通过 :deep 覆盖 */
:deep(.jo-table-container) {
  --jo-table-header-bg: #e0f2fe;
  --jo-table-header-color: #0369a1;
  --jo-table-selected-bg: #dcfce7;
  --jo-table-selected-color: #166534;
}

/* 方式2：全局覆盖 */
.jo-table-container {
  --jo-table-header-bg: #f0f9ff;
  --jo-table-stripe-bg: #f8fafc;
}
</style>
```

### 可自定义的 CSS 变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `--jo-table-header-bg` | `#f8fafc` | 表头背景 |
| `--jo-table-header-color` | `#374151` | 表头文字颜色 |
| `--jo-table-header-hover-bg` | `#e2e8f0` | 表头悬停背景 |
| `--jo-table-header-border` | `#e5e7eb` | 表头边框 |
| `--jo-table-filter-bg` | `#f8fafc` | 过滤行背景 |
| `--jo-table-cell-bg` | `#fff` | 单元格背景 |
| `--jo-table-cell-color` | `#475569` | 单元格文字 |
| `--jo-table-stripe-bg` | `#fafbfc` | 斑马纹背景 |
| `--jo-table-hover-bg` | `#f1f5f9` | 行悬停背景 |
| `--jo-table-selected-bg` | `#eff6ff` | 选中行背景 |
| `--jo-table-selected-color` | `#1e40af` | 选中行文字 |
| `--jo-table-sort-icon-color` | `#3b82f6` | 排序图标颜色 |
| `--jo-table-expand-bg` | `#f8fafc` | 扩展行背景 |

## 插槽

| 插槽名 | 参数 | 说明 |
|--------|------|------|
| `cell-${key}` | `{ row, value, index }` | 自定义单元格 |
| `expand` | `{ row, index }` | 扩展行内容 |

## 示例

### 带扩展行的表格

```vue
<JoTable :data="data" :columns="columns" expandable>
  <template #expand="{ row }">
    <div class="detail">
      <p>详情: {{ row.detail }}</p>
    </div>
  </template>
</JoTable>
```

### 自定义单元格

```vue
<JoTable :data="data" :columns="columns">
  <template #cell-age="{ value }">
    <span :class="{ 'text-red': value > 30 }">{{ value }}岁</span>
  </template>
</JoTable>
```

### 可选择的表格

```vue
<JoTable
  :data="data"
  :columns="columns"
  selectable
  v-model:selected-keys="selectedKeys"
  @selection-change="onSelectionChange"
/>
```
