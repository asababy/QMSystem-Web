import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Module {
  id: string
  name: string
  description: string
  shortDesc: string
  icon: string
  version: string
  stars: number
  downloads: number
  url: string
  category: string
  tags: string[]
  author?: string
  lastUpdated?: string
}

export const useModulesStore = defineStore('modules', () => {
  const modules = ref<Module[]>([])
  const loading = ref(false)
  const error = ref('')

  // 加载模块列表
  const loadModules = async () => {
    loading.value = true
    error.value = ''
    
    try {
      const response = await fetch('/api/modules')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        modules.value = data.data.map((item: any) => ({
          id: item.id || item.name,
          name: item.name,
          description: item.description || item.desc,
          shortDesc: item.shortDesc || item.short_desc,
          icon: item.icon || item.name.charAt(0),
          version: item.version || '1.0.0',
          stars: item.stars || 5,
          downloads: item.downloads || Math.floor(Math.random() * 10000),
          url: item.url || `/modules/${item.name.toLowerCase()}/${item.name.toLowerCase()}`,
          category: item.category || 'business',
          tags: item.tags || [],
          author: item.author || 'System',
          lastUpdated: item.lastUpdated || new Date().toISOString()
        }))
      } else {
        // API 返回失败，使用默认模块
        console.warn('API 返回失败，使用默认模块:', data.message)
        modules.value = getDefaultModules()
      }
    } catch (err) {
      console.error('API 调用失败，使用默认模块:', err)
      error.value = '' // 清除错误显示
      // 提供默认模块
      modules.value = getDefaultModules()
    } finally {
      loading.value = false
    }
  }

  // 获取默认模块
  const getDefaultModules = (): Module[] => [
    {
      id: 'quality',
      name: '质量管理系统',
      description: '从 Oracle WMS 库中按时间范围查询质量检测结果，支持多维度数据分析和报表生成。',
      shortDesc: 'QMSystem 质量检测',
      icon: '质',
      version: '2.0',
      stars: 5,
      downloads: 1200,
      url: '/quality/quality-report',
      category: 'quality',
      tags: ['质量管理', '检测', '报表'],
      author: 'QMSystem Team',
      lastUpdated: new Date().toISOString()
    }
  ]

  // 处理下载
  const handleDownload = async (module: Module) => {
    try {
      // 记录下载统计
      await fetch(`/api/${module.id}/download`, {
        method: 'POST'
      })
      
      // 更新下载次数
      const moduleIndex = modules.value.findIndex(m => m.id === module.id)
      if (moduleIndex !== -1) {
        modules.value[moduleIndex].downloads++
      }
      
      // 打开模块页面
      window.open(module.url, '_blank')
    } catch (error) {
      console.error('Download failed:', error)
      // 直接打开页面
      window.open(module.url, '_blank')
    }
  }

  // 根据分类获取模块
  const getModulesByCategory = (category: string) => {
    return modules.value.filter(m => m.category === category)
  }

  // 搜索模块
  const searchModules = (query: string) => {
    const lowerQuery = query.toLowerCase()
    return modules.value.filter(m => 
      m.name.toLowerCase().includes(lowerQuery) ||
      m.description.toLowerCase().includes(lowerQuery) ||
      m.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }

  return {
    modules,
    loading,
    error,
    loadModules,
    handleDownload,
    getModulesByCategory,
    searchModules
  }
})
