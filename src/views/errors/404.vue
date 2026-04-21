<template>
  <div class="not-found-page">
    <div class="background-pattern">
      <div class="pattern-grid"></div>
    </div>
    <div class="card">
      <div class="icon-wrapper">
        <div class="icon-container">
          <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="pulse-ring"></div>
      </div>
      <div class="content">
        <h1>{{ t('errors.notFoundTitle') }}</h1>
        <p>{{ t('errors.notFoundDesc') }}</p>
        <p class="hint">{{ t('errors.notFoundHint') }}</p>
      </div>
      <div class="actions">
        <button class="btn-primary" @click="goBack" :aria-label="t('common.back')">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ t('common.back') }}
        </button>
        <button class="btn-secondary" @click="goHome" :aria-label="t('common.home')">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20H19V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ t('common.home') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()

const goBack = () => {
  window.history.back()
}

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.not-found-page {
  --qm-primary: #2563eb;
  --qm-primary-hover: #1d4ed8;
  --qm-secondary: #64748b;
  --qm-secondary-hover: #475569;
  --qm-surface: #ffffff;
  --qm-surface-hover: #f8fafc;
  --qm-text-primary: #1e293b;
  --qm-text-secondary: #64748b;
  --qm-border: #e2e8f0;
  --qm-shadow: rgba(0, 0, 0, 0.1);
  --qm-gradient-start: #f8fafc;
  --qm-gradient-end: #e2e8f0;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--qm-gradient-start) 0%, var(--qm-gradient-end) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: relative;
  overflow: hidden;
}

.background-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.1;
  pointer-events: none;
}

.pattern-grid {
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(var(--qm-border) 1px, transparent 1px),
    linear-gradient(90deg, var(--qm-border) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: grid-move 20s linear infinite;
}

@keyframes grid-move {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

.card {
  background: var(--qm-surface);
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 0 20px 40px var(--qm-shadow);
  max-width: 500px;
  width: 90%;
  text-align: center;
  position: relative;
  z-index: 1;
  backdrop-filter: blur(10px);
  border: 1px solid var(--qm-border);
}

.icon-wrapper {
  position: relative;
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
}

.icon-container {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--qm-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 30px rgba(37, 99, 235, 0.3);
  position: relative;
  z-index: 2;
}

.icon {
  width: 40px;
  height: 40px;
  color: white;
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  border: 2px solid var(--qm-primary);
  border-radius: 50%;
  animation: pulse 2s ease-out infinite;
  opacity: 0.3;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 0.1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.3;
  }
}

.content h1 {
  color: var(--qm-text-primary);
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.content p {
  color: var(--qm-text-secondary);
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 0.5rem;
}

.content .hint {
  font-size: 0.9rem;
  opacity: 0.8;
}

.actions {
  display: flex;
  gap: 1rem;
  margin-top: 2.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  text-decoration: none;
}

.btn-primary {
  background: var(--qm-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--qm-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.btn-secondary {
  background: var(--qm-surface);
  color: var(--qm-text-primary);
  border: 1px solid var(--qm-border);
}

.btn-secondary:hover {
  background: var(--qm-surface-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--qm-shadow);
}

.btn-icon {
  width: 16px;
  height: 16px;
}

@media (max-width: 480px) {
  .card {
    padding: 2rem;
    margin: 1rem;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pattern-grid,
  .icon,
  .pulse-ring,
  .card,
  .btn-primary,
  .btn-secondary {
    animation: none;
  }
}
</style>
