<template>
  <TransitionGroup name="toast" tag="div" class="jo-toast-container">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      :class="['jo-toast', `jo-toast--${toast.type}`]"
    >
      <div class="jo-toast__icon">
        <svg v-if="toast.type === 'success'" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
        <svg v-else-if="toast.type === 'error'" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
        <svg v-else-if="toast.type === 'warning'" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
      </div>
      <div class="jo-toast__content">
        <div v-if="toast.title" class="jo-toast__title">{{ toast.title }}</div>
        <div class="jo-toast__message">{{ toast.message }}</div>
      </div>
      <button class="jo-toast__close" @click="removeToast(toast.id)">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
    </div>
  </TransitionGroup>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration: number
}

const toasts = ref<Toast[]>([])

let toastIdCounter = 0

function showToast(options: Omit<Toast, 'id'>) {
  const id = `toast-${++toastIdCounter}`
  const toast: Toast = {
    id,
    ...options,
    duration: options.duration || 3000
  }

  toasts.value.push(toast)

  if (toast.duration > 0) {
    setTimeout(() => {
      removeToast(id)
    }, toast.duration)
  }

  return id
}

function removeToast(id: string) {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

function success(message: string, title?: string, duration?: number) {
  return showToast({ type: 'success', title, message, duration: duration || 3000 })
}

function error(message: string, title?: string, duration?: number) {
  return showToast({ type: 'error', title, message, duration: duration || 5000 })
}

function warning(message: string, title?: string, duration?: number) {
  return showToast({ type: 'warning', title, message, duration: duration || 4000 })
}

function info(message: string, title?: string, duration?: number) {
  return showToast({ type: 'info', title, message, duration: duration || 3000 })
}

// 暴露方法供外部调用
defineExpose({
  showToast,
  removeToast,
  success,
  error,
  warning,
  info
})
</script>

<style scoped>
.jo-toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.jo-toast {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  min-width: 300px;
  max-width: 400px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.04);
  pointer-events: auto;
  position: relative;
  overflow: hidden;
}

.jo-toast::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
}

/* 成功样式 */
.jo-toast--success::before {
  background: linear-gradient(180deg, #22c55e 0%, #16a34a 100%);
}

.jo-toast--success .jo-toast__icon {
  color: #22c55e;
  background: #dcfce7;
}

/* 错误样式 */
.jo-toast--error::before {
  background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%);
}

.jo-toast--error .jo-toast__icon {
  color: #ef4444;
  background: #fee2e2;
}

/* 警告样式 */
.jo-toast--warning::before {
  background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
}

.jo-toast--warning .jo-toast__icon {
  color: #f59e0b;
  background: #fef3c7;
}

/* 信息样式 */
.jo-toast--info::before {
  background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%);
}

.jo-toast--info .jo-toast__icon {
  color: #3b82f6;
  background: #dbeafe;
}

.jo-toast__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  flex-shrink: 0;
}

.jo-toast__content {
  flex: 1;
  min-width: 0;
}

.jo-toast__title {
  font-weight: 600;
  font-size: 14px;
  color: #1f2937;
  margin-bottom: 2px;
}

.jo-toast__message {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
  word-break: break-word;
}

.jo-toast__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
  padding: 0;
  margin-left: 4px;
  flex-shrink: 0;
}

.jo-toast__close:hover {
  background: #f3f4f6;
  color: #4b5563;
}

/* 动画效果 */
.toast-enter-active {
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.toast-leave-active {
  transition: all 0.2s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
