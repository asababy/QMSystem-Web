# QMSystem-UI 代码规范

> 基于 MapaSystem 企业架构规范，参考大厂前端开发标准

## 目录

- [1. 项目结构规范](#1-项目结构规范)
- [2. 命名规范](#2-命名规范)
- [3. 代码风格规范](#3-代码风格规范)
- [4. 组件开发规范](#4-组件开发规范)
- [5. 业务模块规范](#5-业务模块规范)
- [6. 类型定义规范](#6-类型定义规范)
- [7. API 调用规范](#7-api-调用规范)
- [8. 样式规范](#8-样式规范)
- [9. 性能优化规范](#9-性能优化规范)

---

## 1. 项目结构规范

### 1.1 目录结构

```
src/
├── api/                    # 全局 API 模块
│   └── modules/            # API 分模块
├── application/            # 业务模块（按业务单据组织）
│   └── {module-name}/     # 单个业务模块
│       ├── {Module}.vue   # 主视图组件
│       ├── api.ts         # API 调用
│       ├── types.ts       # 类型定义
│       ├── table-config.ts # 表格配置
│       └── search-config.ts # 搜索配置
├── components/            # 全局组件
│   ├── basic/            # 基础组件
│   ├── glass/            # 玻璃拟态组件
│   ├── layout/           # 布局组件
│   └── feedback/         # 反馈组件
├── locales/              # 国际化
├── router/               # 路由配置
├── styles/               # 全局样式
│   └── themes/           # 主题配置
├── themes/               # 主题管理逻辑
├── utils/                # 工具函数
├── views/                # 独立页面（非业务模块）
└── main.ts               # 入口文件
```

### 1.2 业务模块组织原则

- **单一职责**：每个业务模块对应一个业务单据或功能
- **扁平化**：避免过深的目录嵌套，文件直接放在模块根目录
- **模块化**：API、类型、配置、视图分离但同属一个模块

**示例：**
```
application/
├── quality-report/
│   ├── QualityReport.vue
│   ├── api.ts
│   ├── types.ts
│   ├── table-config.ts
│   └── search-config.ts
└── lme-report/
    ├── LmeReport.vue
    ├── api.ts
    ├── types.ts
    ├── table-config.ts
    └── search-config.ts
```

---

## 2. 命名规范

### 2.1 文件命名

- **组件文件**：PascalCase（大驼峰）
  - `QualityReport.vue`
  - `JoTable.vue`

- **工具/配置文件**：kebab-case（短横线）
  - `table-config.ts`
  - `search-config.ts`

- **类型文件**：kebab-case
  - `types.ts`

- **API 文件**：kebab-case
  - `api.ts`

### 2.2 变量命名

- **常量**：UPPER_SNAKE_CASE
  ```typescript
  const MAX_RETRY_COUNT = 3
  const API_BASE_URL = 'https://api.example.com'
  ```

- **普通变量**：camelCase（小驼峰）
  ```typescript
  const userName = 'admin'
  const isLoading = false
  ```

- **布尔值**：is/has/can/should 前缀
  ```typescript
  const isValid = true
  const hasError = false
  const canDownload = true
  const shouldRefresh = true
  ```

- **函数**：camelCase，动词开头
  ```typescript
  const fetchData = () => {}
  const handleSearch = () => {}
  const resetForm = () => {}
  ```

### 2.3 组件命名

- **组件名**：PascalCase
  ```vue
  <script setup lang="ts">
  export default {
    name: 'QualityReport'
  }
  </script>
  ```

- **组件文件名**：与组件名一致
  - `QualityReport.vue` → `name: 'QualityReport'`

### 2.4 类型命名

- **接口/类型**：PascalCase
  ```typescript
  interface QualityReportItem {}
  type SupportedTheme = 'light' | 'dark'
  ```

- **泛型**：T 前缀
  ```typescript
  interface ApiResponse<T> {
    data: T
  }
  ```

---

## 3. 代码风格规范

### 3.1 Vue 组件结构

```vue
<template>
  <!-- 模板内容 -->
</template>

<script setup lang="ts">
// 1. 导入
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

// 2. Props/Emits 定义
interface Props {
  modelValue: string
}
const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// 3. 响应式数据
const loading = ref(false)
const data = ref([])

// 4. 计算属性
const filteredData = computed(() => {
  return data.value.filter(...)
})

// 5. 方法定义
const fetchData = async () => {
  // ...
}

// 6. 生命周期
onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="scss">
/* 样式 */
</style>
```

### 3.2 TypeScript 规范

- **严格模式**：启用所有严格检查
- **类型定义**：避免 `any`，使用具体类型
- **接口优先**：对象类型优先使用 `interface`
- **类型推导**：充分利用类型推导，避免冗余类型标注

```typescript
// ✅ 推荐
interface User {
  id: string
  name: string
}

const user: User = { id: '1', name: 'admin' }

// ❌ 避免
const user: any = { id: '1', name: 'admin' }
```

### 3.3 导入顺序

```typescript
// 1. Vue 相关
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

// 2. 第三方库
import { message } from 'tdesign-vue-next'

// 3. 项目组件
import JoTable from '@/components/basic/table/JoTable.vue'
import GlassCard from '@/components/glass/GlassCard.vue'

// 4. 项目模块
import { qualityReportApi } from './api'
import { useTableColumns } from './table-config'
import type { QualityReportItem } from './types'
```

---

## 4. 组件开发规范

### 4.1 组件设计原则

- **单一职责**：一个组件只做一件事
- **Props 向下**：通过 props 传递数据
- **Events 向上**：通过 emit 传递事件
- **插槽扩展**：通过 slot 提供扩展点

### 4.2 组件 Props 定义

```typescript
interface Props {
  // 必填属性
  data: QualityReportItem[]
  
  // 可选属性
  loading?: boolean
  disabled?: boolean
  
  // 带默认值
  pageSize?: number
  
  // 复杂类型
  columns: JoTableColumn[]
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  disabled: false,
  pageSize: 10
})
```

### 4.3 组件 Events 定义

```typescript
const emit = defineEmits<{
  // 事件名: [参数类型]
  'update:modelValue': [value: string]
  'selection-change': [keys: string[], rows: QualityReportItem[]]
  'search': [params: Record<string, any]>
}>()
```

---

## 5. 业务模块规范

### 5.1 模块文件组织

每个业务模块包含以下文件：

```
{module-name}/
├── {Module}.vue       # 主视图组件
├── api.ts            # API 调用封装
├── types.ts          # TypeScript 类型定义
├── table-config.ts   # 表格列配置（composable）
└── search-config.ts  # 搜索字段配置（composable）
```

### 5.2 API 封装规范

```typescript
// api.ts
import { qmApi } from '@/api/modules'
import type { QualityReportQueryParams } from './types'

export const qualityReportApi = {
  /**
   * 获取质量报告列表
   */
  getList: async (params: QualityReportQueryParams) => {
    const queryParams = new URLSearchParams()
    if (params.startDate) queryParams.append('startDate', params.startDate)
    // ...
    
    return qmApi.getQualityReport(Object.fromEntries(queryParams))
  },

  /**
   * 获取明细行数
   */
  getDetailCounts: async (orderNumbers: string[]) => {
    return qmApi.getQualityReportDetailCounts(orderNumbers)
  }
}
```

### 5.3 类型定义规范

```typescript
// types.ts
import type { JoTableColumn } from '@/components/basic/table/JoTable.vue'
import type { SearchField } from '@/components/basic/search-panel/JoSearchPanel.vue'

/** 查询参数 */
export interface QualityReportQueryParams {
  startDate?: string
  endDate?: string
  orderNumber?: string
  grade?: string
}

/** 数据项 */
export interface QualityReportItem {
  id: string
  name: string
  status: string
}

/** 表格列配置类型 */
export type TableColumns = JoTableColumn[]
```

### 5.4 配置 Composable 规范

```typescript
// table-config.ts
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { TableColumns } from './types'

export const useTableColumns = () => {
  const { t } = useI18n()

  const tableColumns = computed<TableColumns>(() => [
    {
      key: 'id',
      title: t('common.id'),
      sortable: true,
      filterable: true,
    },
    // ...
  ])

  return { tableColumns }
}
```

---

## 6. 类型定义规范

### 6.1 类型定义位置

- **业务类型**：定义在业务模块的 `types.ts`
- **全局类型**：定义在 `src/types/` 目录
- **组件类型**：定义在组件文件内部

### 6.2 类型导出规范

```typescript
// ✅ 推荐：明确导出
export interface User {
  id: string
  name: string
}

export type UserStatus = 'active' | 'inactive'

// ❌ 避免：默认导出类型
export default interface User {
  // ...
}
```

---

## 7. API 调用规范

### 7.1 API 封装原则

- **统一封装**：业务 API 统一封装在模块 `api.ts`
- **类型安全**：使用 TypeScript 类型定义
- **错误处理**：统一错误处理机制
- **参数构建**：使用 URLSearchParams 构建查询参数

### 7.2 API 调用示例

```typescript
// ✅ 推荐
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      startDate: startDate.value,
      endDate: endDate.value,
      orderNumber: orderNumber.value.trim(),
    }
    
    const resp = await qualityReportApi.getList(params)
    
    if (!resp.success) {
      throw new Error(resp.message || '查询失败')
    }
    
    rows.value = resp.data || []
  } catch (error) {
    console.error('查询失败:', error)
    message.value = `查询失败: ${error instanceof Error ? error.message : String(error)}`
  } finally {
    loading.value = false
  }
}

// ❌ 避免：直接调用底层 API
const fetchData = async () => {
  const resp = await qmApi.getQualityReport({ /* ... */ })
  // ...
}
```

---

## 8. 样式规范

### 8.1 样式组织

- **主题变量**：使用 CSS 变量，定义在 `src/styles/themes/`
- **组件样式**：使用 scoped，避免全局污染
- **响应式**：使用媒体查询，支持多设备

### 8.2 CSS 变量使用

```scss
// ✅ 推荐：使用主题变量
.card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  color: var(--text-main);
}

// ❌ 避免：硬编码颜色
.card {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  color: #1f2937;
}
```

### 8.3 样式命名

- **BEM 命名**：Block__Element--Modifier
- **语义化**：使用有意义的类名
- **避免过度嵌套**：嵌套不超过 3 层

```scss
// ✅ 推荐
.quality-report {
  &__header {
    // ...
  }
  
  &__table {
    // ...
  }
  
  &--loading {
    // ...
  }
}

// ❌ 避免
.qr .h .t .c {
  // ...
}
```

---

## 9. 性能优化规范

### 9.1 列表优化

- **虚拟滚动**：大列表使用虚拟滚动
- **分页加载**：大数据量使用分页
- **防抖节流**：搜索、输入使用防抖节流

### 9.2 组件优化

- **计算属性**：使用 computed 缓存计算结果
- **懒加载**：路由组件懒加载
- **按需导入**：第三方库按需导入

```typescript
// ✅ 推荐：路由懒加载
const routes = [
  {
    path: '/quality-report',
    component: () => import('@/application/quality-report/QualityReport.vue')
  }
]

// ✅ 推荐：计算属性
const filteredData = computed(() => {
  return data.value.filter(item => item.status === 'active')
})

// ❌ 避免：方法中重复计算
const getFilteredData = () => {
  return data.value.filter(item => item.status === 'active')
}
```

### 9.3 图片优化

- **懒加载**：图片懒加载
- **格式选择**：使用 WebP 格式
- **压缩**：图片压缩优化

---

## 附录

### A. 推荐工具

- **代码格式化**：Prettier
- **代码检查**：ESLint
- **类型检查**：TypeScript
- **Git Hooks**：Husky + lint-staged

### B. 参考资源

- [Vue 3 官方文档](https://vuejs.org/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [TDesign Vue Next](https://tdesign.tencent.com/vue-next/overview)

### C. 变更记录

- **2026-06-24**: 初始版本，基于 MapaSystem 企业架构规范制定
