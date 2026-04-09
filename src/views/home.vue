<template>
  <div class="portal-home">
    <GlassBackgroundLayer />
    
    <div class="portal-container">
      <header class="portal-header">
        <GlassCard :padding="0" :border-radius="20" class="header-content">
          <div class="header-left">
            <div class="logo-section">
              <div class="logo-icon">
                <t-icon name="dashboard" size="24" />
              </div>
              <div class="logo-text">
                <h1 class="portal-title">质量管理门户</h1>
                <p class="portal-subtitle">Quality Management Portal</p>
              </div>
            </div>
          </div>
          
          <div class="header-right">
            <div class="user-section">
              <t-dropdown trigger="click" :popup-props="{ overlayClassName: 'user-dropdown-popover' }">
                <t-button variant="text" size="small" class="user-btn">
                  <t-avatar size="32" :image="userAvatar">
                    <t-icon name="user" />
                  </t-avatar>
                  <span class="username">{{ userName }}</span>
                  <t-icon name="chevron-down" size="16" />
                </t-button>
                <t-dropdown-menu>
                  <t-dropdown-item @click="handleProfile"><t-icon name="user-circle" /> 个人资料</t-dropdown-item>
                  <t-dropdown-item @click="handleSettings"><t-icon name="setting" /> 系统设置</t-dropdown-item>
                  <t-dropdown-item divider />
                  <t-dropdown-item @click="handleLogout"><t-icon name="logout" /> 退出登录</t-dropdown-item>
                </t-dropdown-menu>
              </t-dropdown>
            </div>
          </div>
        </GlassCard>
      </header>

      <main class="portal-main">
        <!-- 快速导航卡片 -->
        <section class="quick-nav-section">
          <div class="section-header">
            <h2 class="section-title">快速导航</h2>
            <p class="section-subtitle">Quick Navigation</p>
          </div>
          
          <div class="nav-grid">
            <GlassCard 
              v-for="item in navigationItems"
              :key="item.id"
              :class="['nav-card', `nav-card-${item.size}`]"
              @click="navigateTo(item.path)"
            >
              <div class="nav-card-content">
                <div class="nav-icon" :style="{ background: item.iconGradient }">
                  <t-icon :name="item.icon" size="32" color="white" />
                </div>
                <div class="nav-info">
                  <h3 class="nav-title">{{ item.title }}</h3>
                  <p class="nav-description">{{ item.description }}</p>
                  <div class="nav-stats" v-if="item.stats">
                    <div class="stat-item" v-for="stat in item.stats" :key="stat.label">
                      <span class="stat-value">{{ stat.value }}</span>
                      <span class="stat-label">{{ stat.label }}</span>
                    </div>
                  </div>
                </div>
                <div class="nav-arrow">
                  <t-icon name="chevron-right" size="16" />
                </div>
              </div>
            </GlassCard>
          </div>
        </section>

        <section class="tabs-section">
          <div class="section-header">
            <h2 class="section-title">门户导航</h2>
            <p class="section-subtitle">Portal Navigation</p>
          </div>

          <GlassCard class="portal-nav-card" :padding="24">
            <div class="group-tabs-wrapper">
              <div 
                v-for="group in menuGroups" 
                :key="group.name"
                :class="['group-tab-item', { active: activeGroup === group.name }]"
                @click="switchGroup(group.name)"
              >
                <span class="tab-label">{{ group.label }}</span>
                <div class="tab-underline"></div>
              </div>
            </div>

            <transition name="fade-slide" mode="out-in">
              <div class="portal-grid" :key="activeGroup">
                <div 
                  v-for="item in currentGroupItems" 
                  :key="item.path"
                  class="portal-item-card"
                  @click="navigateTo(item.path)"
                >
                  <div class="portal-item-icon" :style="{ background: item.iconGradient }">
                    <t-icon :name="item.icon" size="24" color="white" />
                  </div>
                  <div class="portal-item-info">
                    <h4 class="portal-item-title">{{ item.title }}</h4>
                    <p class="portal-item-desc">{{ item.description }}</p>
                  </div>
                  <t-icon name="chevron-right" class="arrow-icon" size="16" />
                </div>
              </div>
            </transition>
          </GlassCard>
        </section>

        <div class="dashboard-row">
          <section class="status-section">
            <GlassCard class="status-card">
              <div class="status-header">
                <h3 class="status-title">系统状态</h3>
                <div class="status-indicator online">
                  <span class="status-dot"></span>运行正常
                </div>
              </div>
              <div class="status-grid">
                <div class="status-item" v-for="status in systemStatus" :key="status.name">
                  <div class="status-icon" :class="status.status">
                    <t-icon :name="status.icon" size="20" />
                  </div>
                  <div class="status-info">
                    <span class="status-name">{{ status.name }}</span>
                    <span class="status-value">{{ status.value }}</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </section>

          <section class="activity-section">
            <GlassCard class="activity-card">
              <div class="activity-header">
                <h3 class="activity-title">最近活动</h3>
                <t-button variant="text" size="small" @click="viewAllActivities">
                  查看全部 <t-icon name="chevron-right" size="16" />
                </t-button>
              </div>
              <div class="activity-list">
                <div class="activity-item" v-for="activity in recentActivities" :key="activity.id">
                  <div class="activity-icon" :style="{ background: activity.color }">
                    <t-icon :name="activity.icon" size="16" color="white" />
                  </div>
                  <div class="activity-content">
                    <p class="activity-text">{{ activity.text }}</p>
                    <span class="activity-time">{{ activity.time }}</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import GlassBackgroundLayer from '@/components/GlassBackgroundLayer.vue'
import GlassCard from '@/components/GlassCard.vue'
import qmsMenu from '@/router/qms_menu.json'

const router = useRouter()

// 用户信息
const userName = ref('')
const userAvatar = ref('')

// 导航项数据
const navigationItems = ref([
  {
    id: 1,
    title: '质量报告',
    description: '查看和分析质量检测报告',
    icon: 'chart-line',
    path: '/quality/report',
    size: 'large',
    iconGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    stats: [
      { label: '今日报告', value: '12' },
      { label: '待处理', value: '3' }
    ]
  },
  {
    id: 2,
    title: '检测管理',
    description: '管理质量检测任务和流程',
    icon: 'search',
    path: '/quality/inspection',
    size: 'normal',
    iconGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    id: 3,
    title: '数据分析',
    description: '质量数据统计和趋势分析',
    icon: 'pie-chart',
    path: '/quality/analytics',
    size: 'normal',
    iconGradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    id: 4,
    title: '标准管理',
    description: '质量标准和规范管理',
    icon: 'book',
    path: '/quality/standards',
    size: 'normal',
    iconGradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  },
  {
    id: 5,
    title: '设备管理',
    description: '检测设备状态和维护管理',
    icon: 'setting',
    path: '/quality/equipment',
    size: 'normal',
    iconGradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  },
  {
    id: 6,
    title: '用户管理',
    description: '系统用户权限和角色管理',
    icon: 'user',
    path: '/quality/users',
    size: 'normal',
    iconGradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
  }
])

// 系统状态数据
const systemStatus = ref([
  { name: '数据库', value: '正常', icon: 'database', status: 'online' },
  { name: 'API 服务', value: '正常', icon: 'server', status: 'online' },
  { name: '文件存储', value: '99.2%', icon: 'storage', status: 'warning' },
  { name: '缓存服务', value: '正常', icon: 'cloud', status: 'online' }
])

// 最近活动数据
const recentActivities = ref([
  { id: 1, text: '用户 张三 完成了产品质量检测 #1234', time: '2分钟前', icon: 'check-circle', color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
  { id: 2, text: '系统自动备份完成', time: '15分钟前', icon: 'cloud-upload', color: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' },
  { id: 3, text: '质量标准文档已更新', time: '2小时前', icon: 'document', color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }
])

// --- 核心逻辑：动态菜单分组 ---
const activeGroup = ref('')

const menuGroups = computed(() => {
  const groupsMap: Record<string, any> = {}
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  ]

  let colorIdx = 0

  qmsMenu.forEach((item: any) => {
    // 递归处理子路由
    const processRoute = (route: any, parentPath: string = '') => {
      const fullPath = route.path.startsWith('/') ? route.path : `${parentPath}/${route.path}`
      
      if (route.meta?.elmenuitemgroup) {
        const gName = route.meta.elmenuitemgroup
        if (!groupsMap[gName]) {
          groupsMap[gName] = {
            name: gName,
            label: gName,
            items: [],
            iconGradient: gradients[colorIdx % gradients.length]
          }
          colorIdx++
        }
        
        groupsMap[gName].items.push({
          title: route.meta.title || route.name,
          description: `${route.meta.title || ''} 管理模块`,
          icon: route.meta.iconClass?.replace('bi bi-', '') || 'view-module',
          path: fullPath,
          iconGradient: groupsMap[gName].iconGradient
        })
      }

      if (route.children) {
        route.children.forEach((child: any) => processRoute(child, fullPath))
      }
    }
    processRoute(item)
  })

  return Object.values(groupsMap)
})

const currentGroupItems = computed(() => {
  const group = menuGroups.value.find(g => g.name === activeGroup.value)
  return group ? group.items : []
})

const switchGroup = (name: string) => {
  activeGroup.value = name
}

// 导航与操作
const navigateTo = (path: string) => router.push(path)
const handleProfile = () => router.push('/profile')
const handleSettings = () => router.push('/settings')
const handleLogout = () => {
  localStorage.removeItem('accessToken')
  router.push('/login')
}
const viewAllActivities = () => router.push('/activities')

const applyUser = (user: any) => {
  if (!user || typeof user !== 'object') return

  userName.value =
    user.realName ||
    user.name ||
    user.username ||
    user.userName ||
    user.displayName ||
    userName.value

  userAvatar.value = user.avatar || userAvatar.value
}

const parseUserFromToken = (token: string) => {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join('')
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

const syncUser = (detail?: any) => {
  if (detail?.user) {
    applyUser(detail.user)
    return
  }

  const userInfo = localStorage.getItem('userInfo')
  if (userInfo) {
    try {
      applyUser(JSON.parse(userInfo))
      return
    } catch {
      // ignore
    }
  }

  const token = localStorage.getItem('accessToken')
  if (token) {
    applyUser(parseUserFromToken(token))
  }
}

const handleQmInit = (event: Event) => {
  const customEvent = event as CustomEvent
  syncUser(customEvent.detail)
}

onMounted(() => {
  window.addEventListener('qm:init', handleQmInit as EventListener)
  syncUser()
  
  // 默认选中第一个 Tab
  if (menuGroups.value.length > 0) {
    activeGroup.value = menuGroups.value[0].name
  }
})

onUnmounted(() => {
  window.removeEventListener('qm:init', handleQmInit as EventListener)
})
</script>

<style scoped>
.portal-home {
  position: relative;
  min-height: 100vh;
  width: 100%;
  padding-bottom: 40px;
}

.portal-container {
  position: relative;
  z-index: 1;
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 章节标题 */
.section-header {
  margin-bottom: 24px;
}

.section-title {
  font-size: 28px;
  font-weight: 700;
  color: #1d1b4b;
  margin: 0 0 4px 0;
  letter-spacing: -0.3px;
}

.section-subtitle {
  font-size: 16px;
  color: rgba(29, 27, 75, 0.55);
  margin: 0;
  font-weight: 500;
}

/* 快速导航网格 */
.nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.nav-card {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
}

.nav-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(29, 27, 75, 0.12);
}

.nav-card-large {
  grid-column: span 2;
}

.nav-card-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 24px;
}

.nav-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.nav-info {
  flex: 1;
}

.nav-title {
  font-size: 18px;
  font-weight: 700;
  color: #1d1b4b;
  margin: 0 0 8px 0;
}

.nav-description {
  font-size: 14px;
  color: rgba(29, 27, 75, 0.55);
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.nav-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #1d1b4b;
}

.stat-label {
  font-size: 12px;
  color: rgba(29, 27, 75, 0.55);
  font-weight: 500;
}

.nav-arrow {
  margin-left: auto;
  color: rgba(29, 27, 75, 0.42);
}

/* Header */
.portal-header { margin-bottom: 32px; }
.header-content {
  width: 100%;
}

.header-content :deep(.glass-card-content) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 24px;
  min-height: 80px;
}

.header-left {
  display: flex; 
  align-items: center; 
  flex: 1;
  min-width: 0;
}
.header-right {
  display: flex; 
  align-items: center; 
  flex-shrink: 0;
}
.logo-section { display: flex; align-items: center; gap: 16px; }
.logo-icon {
  width: 48px; height: 48px; border-radius: 12px;
  background: linear-gradient(135deg, #7c6cf0 0%, #7eb6ff 100%);
  display: flex; align-items: center; justify-content: center; color: white;
}
.portal-title { font-size: 22px; font-weight: 700; color: #1d1b4b; margin: 0; }
.portal-subtitle { font-size: 12px; color: rgba(29, 27, 75, 0.5); margin: 0; }
.user-section { display: flex; align-items: center; }
.user-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 10px;
  padding: 4px 8px;
  min-height: 36px;
}
.username { font-size: 14px; font-weight: 500; color: #1d1b4b; }

/* 用户下拉菜单尺寸收敛 */
:deep(.user-dropdown-popover .t-dropdown__menu) {
  min-width: 144px;
  padding: 4px;
  border-radius: 10px;
}

:deep(.user-dropdown-popover .t-dropdown__item) {
  min-height: 32px;
  padding: 6px 10px;
  font-size: 13px;
  line-height: 1.3;
}

:deep(.user-dropdown-popover .t-dropdown__item .t-icon) {
  font-size: 14px;
}

/* 业务导航 Tab 样式 (还原截图效果) */
.portal-nav-card { margin-bottom: 32px; border: 1px solid rgba(255, 255, 255, 0.4); }

.group-tabs-wrapper {
  display: flex; gap: 32px; border-bottom: 1px solid rgba(29, 27, 75, 0.08);
  margin-bottom: 24px; overflow-x: auto;
}

.group-tab-item {
  position: relative; padding: 12px 4px; cursor: pointer; transition: all 0.3s;
}

.tab-label { font-size: 16px; font-weight: 500; color: rgba(29, 27, 75, 0.6); }

.group-tab-item.active .tab-label { color: #0052d9; font-weight: 700; }

.tab-underline {
  position: absolute; bottom: 0; left: 0; width: 0; height: 3px;
  background: #0052d9; border-radius: 2px; transition: width 0.3s;
}

.group-tab-item.active .tab-underline { width: 100%; }

/* 卡片网格 */
.portal-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;
}

.portal-item-card {
  display: flex; align-items: center; padding: 20px;
  background: rgba(255, 255, 255, 0.3); border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 16px; cursor: pointer; transition: all 0.3s ease;
}

.portal-item-card:hover {
  background: white; transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(29, 27, 75, 0.1); border-color: #0052d9;
}

.portal-item-icon {
  width: 52px; height: 52px; border-radius: 12px; display: flex;
  align-items: center; justify-content: center; margin-right: 16px; flex-shrink: 0;
}

.portal-item-info { flex: 1; overflow: hidden; }
.portal-item-title { font-size: 16px; font-weight: 600; color: #1d1b4b; margin: 0 0 4px 0; }
.portal-item-desc { font-size: 12px; color: rgba(29, 27, 75, 0.5); margin: 0; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; }

.arrow-icon { color: rgba(29, 27, 75, 0.3); opacity: 0; transition: 0.3s; }
.portal-item-card:hover .arrow-icon { opacity: 1; transform: translateX(5px); }

/* 其他区块布局 */
.dashboard-row { display: grid; grid-template-columns: 3fr 2fr; gap: 32px; }

.status-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px; }
.status-item {
  display: flex; align-items: center; gap: 12px; padding: 16px;
  background: rgba(255, 255, 255, 0.4); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.4);
}

.status-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; }
.status-icon.online { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
.status-icon.warning { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }

.activity-list { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
.activity-item {
  display: flex; align-items: center; gap: 12px; padding: 12px;
  background: rgba(255, 255, 255, 0.2); border-radius: 10px;
}

/* 动画 */
.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.3s ease; }
.fade-slide-enter-from { opacity: 0; transform: translateY(10px); }
.fade-slide-leave-to { opacity: 0; transform: translateY(-10px); }

@media (max-width: 1024px) {
  .dashboard-row { grid-template-columns: 1fr; }
}
</style>
