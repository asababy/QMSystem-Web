<template>
  <Transition name="dialog-fade">
    <div v-if="visible" class="jo-dialog-overlay" @click="handleOverlayClick">
      <div class="jo-dialog" :class="[`jo-dialog--${type}`]" @click.stop>
        <!-- 图标 -->
        <div class="jo-dialog__icon">
          <svg v-if="type === 'confirm'" viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <svg v-else-if="type === 'warning'" viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <svg v-else-if="type === 'error'" viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
        </div>

        <!-- 标题 -->
        <div v-if="title" class="jo-dialog__title">{{ title }}</div>

        <!-- 内容 -->
        <div class="jo-dialog__message">{{ message }}</div>

        <!-- 按钮 -->
        <div class="jo-dialog__actions">
          <button
            class="jo-dialog__btn jo-dialog__btn--cancel"
            @click="handleCancel"
          >
            {{ cancelText }}
          </button>
          <button
            class="jo-dialog__btn jo-dialog__btn--confirm"
            :class="[`jo-dialog__btn--${type}`]"
            @click="handleConfirm"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface DialogOptions {
  type?: 'confirm' | 'warning' | 'error' | 'info'
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  closeOnClickOverlay?: boolean
}

const visible = ref(false)
const type = ref<DialogOptions['type']>('confirm')
const title = ref('')
const message = ref('')
const confirmText = ref('确定')
const cancelText = ref('取消')
const closeOnClickOverlay = ref(true)

let resolvePromise: ((value: boolean) => void) | null = null

function show(options: DialogOptions): Promise<boolean> {
  type.value = options.type || 'confirm'
  title.value = options.title || ''
  message.value = options.message
  confirmText.value = options.confirmText || '确定'
  cancelText.value = options.cancelText || '取消'
  closeOnClickOverlay.value = options.closeOnClickOverlay !== false
  visible.value = true

  return new Promise((resolve) => {
    resolvePromise = resolve
  })
}

function handleConfirm() {
  visible.value = false
  resolvePromise?.(true)
}

function handleCancel() {
  visible.value = false
  resolvePromise?.(false)
}

function handleOverlayClick() {
  if (closeOnClickOverlay.value) {
    handleCancel()
  }
}

// 便捷方法
function confirm(message: string, title?: string, options?: Partial<DialogOptions>) {
  return show({
    type: 'confirm',
    message,
    title,
    ...options
  })
}

function warning(message: string, title?: string, options?: Partial<DialogOptions>) {
  return show({
    type: 'warning',
    message,
    title,
    ...options
  })
}

defineExpose({
  show,
  confirm,
  warning
})
</script>

<style scoped>
.jo-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.jo-dialog {
  background: #fff;
  border-radius: 16px;
  padding: 32px 28px;
  min-width: 360px;
  max-width: 480px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
  animation: dialogScale 0.3s ease;
}

@keyframes dialogScale {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 图标 */
.jo-dialog__icon {
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
}

.jo-dialog--confirm .jo-dialog__icon {
  color: #3b82f6;
}

.jo-dialog--warning .jo-dialog__icon,
.jo-dialog--error .jo-dialog__icon {
  color: #f59e0b;
}

.jo-dialog--info .jo-dialog__icon {
  color: #6b7280;
}

/* 标题 */
.jo-dialog__title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
}

/* 消息 */
.jo-dialog__message {
  font-size: 15px;
  color: #4b5563;
  line-height: 1.6;
  margin-bottom: 24px;
  white-space: pre-wrap;
}

/* 按钮区域 */
.jo-dialog__actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.jo-dialog__btn {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-width: 88px;
}

/* 取消按钮 */
.jo-dialog__btn--cancel {
  background: #f3f4f6;
  color: #4b5563;
}

.jo-dialog__btn--cancel:hover {
  background: #e5e7eb;
}

/* 确认按钮 */
.jo-dialog__btn--confirm {
  background: #3b82f6;
  color: #fff;
}

.jo-dialog__btn--confirm:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
}

.jo-dialog__btn--warning {
  background: #f59e0b;
}

.jo-dialog__btn--warning:hover {
  background: #d97706;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.35);
}

.jo-dialog__btn--error {
  background: #ef4444;
}

.jo-dialog__btn--error:hover {
  background: #dc2626;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.35);
}

/* 过渡动画 */
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: all 0.3s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

.dialog-fade-enter-from .jo-dialog,
.dialog-fade-leave-to .jo-dialog {
  transform: scale(0.95) translateY(-10px);
  opacity: 0;
}
</style>
