<template>
  <div class="unauthorized-page">
    <div class="background-pattern">
      <div class="pattern-grid"></div>
    </div>
    <div class="card">
      <div class="icon-wrapper">
        <div class="icon-container error">
          <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 9V13M12 17H12.01M5.07183 19H18.9282C19.4817 19 19.8868 18.6056 19.8995 18.0523L19.9998 13.0523C20.0125 12.499 19.6181 12.094 19.0648 12.0813L12 11.9197L4.93523 12.0813C4.38194 12.094 3.98752 12.499 4.00022 13.0523L4.10052 18.0523C4.11322 18.6056 4.51833 19 5.07183 19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 3C10.9391 3 9.92172 3.42143 9.17157 4.17157C8.42143 4.92172 8 5.93913 8 7C8 8.06087 8.42143 9.07828 9.17157 9.82843C9.92172 10.5786 10.9391 11 12 11C13.0609 11 14.0783 10.5786 14.8284 9.82843C15.5786 9.07828 16 8.06087 16 7C16 5.93913 15.5786 4.92172 14.8284 4.17157C14.0783 3.42143 13.0609 3 12 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="pulse-ring error"></div>
      </div>
      <div class="content">
        <h1>{{ t('errors.unauthorizedTitle') }}</h1>
        <p>{{ t('errors.unauthorizedDesc') }}</p>
        <p class="hint">{{ t('errors.unauthorizedHint') }}</p>
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
.unauthorized-page {
  --qm-primary: #2563eb;
  --qm-primary-hover: #1d4ed8;
  --qm-secondary: #64748b;
  --qm-secondary-hover: #475569;
  --qm-error: #dc2626;
  --qm-error-hover: #b91c1c;
  --qm-surface: #ffffff;
  --qm-surface-hover: #f8fafc;
  --qm-text-primary: #1e293b;
  --qm-text-secondary: #64748b;
  --qm-border: #e2e8f0;
  --qm-shadow: rgba(0, 0, 0, 0.1);
  --qm-gradient-start: #fef2f2;
  --qm-gradient-end: #fee2e2;
}

[data-theme="dark"] {
  --qm-primary: #3b82f6;
  --qm-primary-hover: #60a5fa;
  --qm-secondary: #94a3b8;
  --qm-secondary-hover: #cbd5e1;
  --qm-error: #ef4444;
  --qm-error-hover: #f87171;
  --qm-surface: #1e293b;
  --qm-surface-hover: #334155;
  --qm-text-primary: #f1f5f9;
  --qm-text-secondary: #94a3b8;
  --qm-border: #334155;
  --qm-shadow: rgba(0, 0, 0, 0.3);
  --qm-gradient-start: #450a0a;
  --qm-gradient-end: #7f1d1d;
}

.unauthorized-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--qm-gradient-start) 0%, var(--qm-gradient-end) 100%);
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.background-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.3;
  pointer-events: none;
}

.pattern-grid {
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(var(--qm-border) 1px, transparent 1px),
    linear-gradient(90deg, var(--qm-border) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: patternFloat 20s linear infinite;
}

@keyframes patternFloat {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

.card {
  background: var(--qm-surface);
  border-radius: 20px;
  padding: 3rem;
  text-align: center;
  box-shadow: 
    0 20px 25px -5px var(--qm-shadow),
    0 10px 10px -5px var(--qm-shadow);
  max-width: 480px;
  width: 100%;
  position: relative;
  backdrop-filter: blur(10px);
  border: 1px solid var(--qm-border);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 25px 50px -12px var(--qm-shadow),
    0 20px 25px -5px var(--qm-shadow);
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
  background: linear-gradient(135deg, var(--qm-error), var(--qm-error-hover));
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.icon-container.error {
  animation: errorShake 0.5s ease-in-out;
}

@keyframes errorShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.icon {
  width: 40px;
  height: 40px;
  color: white;
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2px solid var(--qm-error);
  animation: pulseRing 2s ease-out infinite;
  z-index: 1;
}

.pulse-ring.error {
  animation: pulseRingError 2s ease-out infinite;
}

@keyframes pulseRingError {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.4);
    opacity: 0;
  }
}

.content {
  margin-bottom: 2.5rem;
}

h1 {
  color: var(--qm-text-primary);
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
}

p {
  color: var(--qm-text-secondary);
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.hint {
  font-size: 0.875rem;
  opacity: 0.8;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary, .btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.btn-primary {
  background: linear-gradient(135deg, var(--qm-primary), var(--qm-primary-hover));
  color: white;
  box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.3);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px 0 rgba(37, 99, 235, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-secondary {
  background: var(--qm-surface);
  color: var(--qm-text-secondary);
  border: 1px solid var(--qm-border);
}

.btn-secondary:hover {
  background: var(--qm-surface-hover);
  transform: translateY(-1px);
}

.btn-secondary:active {
  transform: translateY(0);
}

.btn-icon {
  width: 16px;
  height: 16px;
}

@media (max-width: 640px) {
  .card {
    padding: 2rem;
    margin: 1rem;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .btn-primary, .btn-secondary {
    width: 100%;
    justify-content: center;
  }
  
  h1 {
    font-size: 1.75rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pattern-grid,
  .icon,
  .pulse-ring,
  .card,
  .btn-primary,
  .btn-secondary,
  .icon-container.error {
    animation: none;
  }
}
</style>
