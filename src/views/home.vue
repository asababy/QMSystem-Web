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
                <h1 class="portal-title">{{ t('home.portalTitle') }}</h1>
                <p class="portal-subtitle">{{ t('home.portalSubtitle') }}</p>
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
                  <t-dropdown-item @click="handleProfile"><t-icon name="user-circle" /> {{ t('home.profile') }}</t-dropdown-item>
                  <t-dropdown-item @click="handleSettings"><t-icon name="setting" /> {{ t('home.settings') }}</t-dropdown-item>
                  <t-dropdown-item @click="handleLanguageSwitch('zh-CN')"><t-icon name="translate-1" /> {{ t('common.chinese') }}</t-dropdown-item>
                  <t-dropdown-item @click="handleLanguageSwitch('en-US')"><t-icon name="translate-1" /> {{ t('common.english') }}</t-dropdown-item>
                  <t-dropdown-item divider />
                  <t-dropdown-item @click="handleLogout"><t-icon name="logout" /> {{ t('home.logout') }}</t-dropdown-item>
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
            <h2 class="section-title">{{ t('home.quickNav') }}</h2>
            <p class="section-subtitle">{{ t('home.quickNavSub') }}</p>
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
            <h2 class="section-title">{{ t('home.portalNav') }}</h2>
            <p class="section-subtitle">{{ t('home.portalNavSub') }}</p>
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
                <h3 class="status-title">{{ t('home.systemStatus') }}</h3>
                <div :class="['status-indicator', isOnline ? 'online' : 'offline']">
                  <span class="status-dot"></span>{{ isOnline ? t('home.statusOnline') : t('home.statusOffline') }}
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
                <h3 class="activity-title">{{ t('home.recentActivity') }}</h3>
                <t-button variant="text" size="small" @click="viewAllActivities">
                  {{ t('home.viewAll') }} <t-icon name="chevron-right" size="16" />
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

    <!-- 用户登录活动抽屉 -->
    <t-drawer
      v-model:visible="activityDrawerVisible"
      :header="t('home.userActivityTitle') || '用户登录记录'"
      :footer="false"
      size="400px"
      :close-on-overlay-click="true"
      @close="stopActivitiesAutoRefresh"
    >
      <div class="activity-drawer-content">
        <!-- 刷新按钮 -->
        <div class="drawer-toolbar">
          <t-button 
            size="small" 
            variant="outline"
            :loading="isRefreshingActivities"
            @click="refreshActivities"
          >
            <t-icon name="refresh" :class="{ 'spin-animation': isRefreshingActivities }" />
            {{ isRefreshingActivities ? (t('home.refreshing') || '刷新中...') : (t('home.manualRefresh') || '手动刷新') }}
          </t-button>
          <span class="auto-refresh-hint">{{ t('home.autoRefreshHint') || '每60秒自动刷新' }}</span>
        </div>

        <!-- 用户列表 -->
        <div class="user-activity-list">
          <div 
            v-for="user in userActivities" 
            :key="user.id"
            class="user-activity-item"
          >
            <div class="user-avatar-wrapper">
              <t-avatar size="40" :image="user.avatar">
                {{ user.realName?.charAt(0) || user.username.charAt(0) }}
              </t-avatar>
              <div class="online-status" :class="{ online: user.isOnline }"></div>
            </div>
            <div class="user-info">
              <div class="user-name-row">
                <span class="user-real-name">{{ user.realName }}</span>
                <span class="user-username">({{ user.username }})</span>
              </div>
              <div class="user-meta">
                <span class="login-time" :title="new Date(user.lastLoginTime).toLocaleString()">
                  {{ formatTime(user.lastLoginTime) }}
                </span>
                <span v-if="user.ip" class="user-ip">IP: {{ user.ip }}</span>
              </div>
            </div>
            <div class="user-status-badge" :class="{ online: user.isOnline }">
              {{ user.isOnline ? (t('home.online') || '在线') : (t('home.offline') || '离线') }}
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="userActivities.length === 0 && !isRefreshingActivities" class="empty-state">
          <t-icon name="user-group" size="48" color="var(--td-gray-color-4)" />
          <p>{{ t('home.noActivityData') || '暂无用户登录数据' }}</p>
        </div>
      </div>
    </t-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import GlassBackgroundLayer from '@/components/GlassBackgroundLayer.vue'
import GlassCard from '@/components/GlassCard.vue'
import qmsMenu from '@/router/qms_menu.json'
import { setLanguage } from '@/locales'

const router = useRouter()
const { t } = useI18n()

// 用户信息
const userName = ref('')
const userAvatar = ref('')

// WebSocket 系统状态
const isOnline = ref(false)
const lastUpdated = ref('')
const socket = ref<WebSocket | null>(null)
const serviceHealthStatuses = ref<Record<string, { status: string; value: string; message: string }>>({
  API: { status: 'offline', value: '检查中', message: '等待检查' },
  Database: { status: 'offline', value: '检查中', message: '等待检查' },
  Cache: { status: 'offline', value: '检查中', message: '等待检查' },
  FileStorage: { status: 'offline', value: '检查中', message: '等待检查' }
})

const initWebSocket = () => {
  const wsUri = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`
  socket.value = new WebSocket(wsUri)
  socket.value.onopen = () => { isOnline.value = true }
  socket.value.onclose = () => { isOnline.value = false; setTimeout(initWebSocket, 5000) }
  socket.value.onmessage = (e: MessageEvent) => {
    const msg = JSON.parse(e.data)
    if (msg.time) lastUpdated.value = msg.time
    
    // 处理系统健康状态
    if (msg.type === 'systemHealth' && msg.data) {
      Object.keys(msg.data).forEach(key => {
        const service = msg.data[key]
        serviceHealthStatuses.value[key] = {
          status: service.status,
          value: service.value,
          message: service.message
        }
      })
    }
  }
}

const navigationItems = computed(() => ([
  {
    id: 1,
    title: t('home.nav.reportTitle'),
    description: t('home.nav.reportDesc'),
    icon: 'chart-line',
    path: '/quality/report',
    size: 'large',
    iconGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    stats: [
      { label: t('home.nav.todayReports'), value: '12' },
      { label: t('home.nav.pending'), value: '3' }
    ]
  },
  {
    id: 2,
    title: t('home.nav.inspectionTitle'),
    description: t('home.nav.inspectionDesc'),
    icon: 'search',
    path: '/quality/inspection',
    size: 'normal',
    iconGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    id: 3,
    title: t('home.nav.analyticsTitle'),
    description: t('home.nav.analyticsDesc'),
    icon: 'pie-chart',
    path: '/quality/analytics',
    size: 'normal',
    iconGradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    id: 4,
    title: t('home.nav.standardsTitle'),
    description: t('home.nav.standardsDesc'),
    icon: 'book',
    path: '/quality/standards',
    size: 'normal',
    iconGradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  },
  {
    id: 5,
    title: t('home.nav.equipmentTitle'),
    description: t('home.nav.equipmentDesc'),
    icon: 'setting',
    path: '/quality/equipment',
    size: 'normal',
    iconGradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  },
  {
    id: 6,
    title: t('home.nav.usersTitle'),
    description: t('home.nav.usersDesc'),
    icon: 'user',
    path: '/quality/users',
    size: 'normal',
    iconGradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
  }
]))

// 系统状态数据
const systemStatus = computed(() => ([
  { name: t('home.status.api'), value: serviceHealthStatuses.value.API.value, icon: 'server', status: serviceHealthStatuses.value.API.status },
  { name: t('home.status.db'), value: serviceHealthStatuses.value.Database.value, icon: 'database', status: serviceHealthStatuses.value.Database.status },
  { name: t('home.status.cache'), value: serviceHealthStatuses.value.Cache.value, icon: 'cloud', status: serviceHealthStatuses.value.Cache.status },
  { name: t('home.status.fileStorage'), value: serviceHealthStatuses.value.FileStorage.value, icon: 'storage', status: serviceHealthStatuses.value.FileStorage.status }
]))

// 最近活动数据
const recentActivities = computed(() => ([
  { id: 1, text: t('home.activity.a1'), time: t('home.activity.t1'), icon: 'check-circle', color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
  { id: 2, text: t('home.activity.a2'), time: t('home.activity.t2'), icon: 'cloud-upload', color: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' },
  { id: 3, text: t('home.activity.a3'), time: t('home.activity.t3'), icon: 'document', color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }
]))

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
          description: `${route.meta.title || ''} ${t('home.groupDescSuffix')}`,
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
const handleLanguageSwitch = (lang: string) => {
  setLanguage(lang)
}
const handleLogout = () => {
  localStorage.removeItem('accessToken')
  router.push('/login')
}
// 用户登录活动管理
const activityDrawerVisible = ref(false)
const userActivities = ref<Array<{
  id: string
  username: string
  realName: string
  avatar?: string
  lastLoginTime: string
  isOnline: boolean
  ip?: string
}>>([])
const isRefreshingActivities = ref(false)
let activitiesRefreshTimer: number | null = null

// 查看全部活动 - 显示抽屉
const viewAllActivities = () => {
  activityDrawerVisible.value = true
  refreshActivities()
}

// 刷新用户活动数据
const refreshActivities = async () => {
  if (isRefreshingActivities.value) return
  isRefreshingActivities.value = true

  try {
    // 模拟从 WebSocket 或 API 获取数据
    // 实际项目中应该从 WebSocket 消息或调用 API 获取
    const mockData = [
      { id: '1', username: 'admin', realName: '管理员', lastLoginTime: new Date().toISOString(), isOnline: true, ip: '192.168.1.100' },
      { id: '2', username: 'zhangsan', realName: '张三', lastLoginTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(), isOnline: true, ip: '192.168.1.101' },
      { id: '3', username: 'lisi', realName: '李四', lastLoginTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(), isOnline: false, ip: '192.168.1.102' },
      { id: '4', username: 'wangwu', realName: '王五', lastLoginTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), isOnline: false, ip: '192.168.1.103' },
      { id: '5', username: 'zhaoliu', realName: '赵六', lastLoginTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), isOnline: false, ip: '192.168.1.104' }
    ]
    
    // 按登录时间倒序排列
    userActivities.value = mockData.sort((a, b) => 
      new Date(b.lastLoginTime).getTime() - new Date(a.lastLoginTime).getTime()
    )
  } finally {
    // 延迟结束刷新动画，让用户感知到
    setTimeout(() => {
      isRefreshingActivities.value = false
    }, 500)
  }
}

// 启动自动刷新
const startActivitiesAutoRefresh = () => {
  stopActivitiesAutoRefresh()
  activitiesRefreshTimer = window.setInterval(() => {
    if (activityDrawerVisible.value) {
      refreshActivities()
    }
  }, 60000) // 60秒刷新一次
}

// 停止自动刷新
const stopActivitiesAutoRefresh = () => {
  if (activitiesRefreshTimer) {
    clearInterval(activitiesRefreshTimer)
    activitiesRefreshTimer = null
  }
}

// 格式化时间显示
const formatTime = (timeStr: string) => {
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return `${Math.floor(diff / 86400000)}天前`
}

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
  initWebSocket()
  startActivitiesAutoRefresh()
  
  // 默认选中第一个 Tab
  if (menuGroups.value.length > 0) {
    activeGroup.value = menuGroups.value[0].name
  }
})

onUnmounted(() => {
  window.removeEventListener('qm:init', handleQmInit as EventListener)
  if (socket.value) socket.value.close()
  stopActivitiesAutoRefresh()
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
.status-icon.offline { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }

.status-indicator.offline { color: #ef4444; }
.status-indicator.offline .status-dot { background: #ef4444; }

.activity-list { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
.activity-item {
  display: flex; align-items: center; gap: 12px; padding: 12px;
  background: rgba(255, 255, 255, 0.2); border-radius: 10px;
}

/* 动画 */
.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.3s ease; }
.fade-slide-enter-from { opacity: 0; transform: translateY(10px); }
.fade-slide-leave-to { opacity: 0; transform: translateY(-10px); }

/* 用户活动抽屉样式 */
.activity-drawer-content {
  padding: 16px 0;
}

.drawer-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  margin-bottom: 16px;
}

.auto-refresh-hint {
  font-size: 12px;
  color: rgba(29, 27, 75, 0.5);
}

.spin-animation {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.user-activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 16px;
}

.user-activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  transition: all 0.2s ease;
}

.user-activity-item:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: translateX(4px);
}

.user-avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.online-status {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #9ca3af;
  border: 2px solid white;
  transition: background 0.3s ease;
}

.online-status.online {
  background: #10b981;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.user-real-name {
  font-size: 14px;
  font-weight: 600;
  color: #1d1b4b;
}

.user-username {
  font-size: 12px;
  color: rgba(29, 27, 75, 0.5);
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: rgba(29, 27, 75, 0.5);
}

.login-time {
  cursor: help;
}

.user-ip {
  font-family: monospace;
  background: rgba(29, 27, 75, 0.05);
  padding: 2px 6px;
  border-radius: 4px;
}

.user-status-badge {
  flex-shrink: 0;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: rgba(156, 163, 175, 0.15);
  color: #6b7280;
}

.user-status-badge.online {
  background: rgba(16, 185, 129, 0.15);
  color: #059669;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 16px;
  color: rgba(29, 27, 75, 0.5);
}

.empty-state p {
  margin-top: 12px;
  font-size: 14px;
}

@media (max-width: 1024px) {
  .dashboard-row { grid-template-columns: 1fr; }
}
</style>
