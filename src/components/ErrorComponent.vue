<template>
  <div class="error-component">
    <GlassCard class="error-card">
      <div class="error-content">
        <t-icon name="error-circle" size="48" color="#ef4444" />
        <h3>组件加载失败</h3>
        <p>{{ errorMessage || '网络连接异常，请稍后重试' }}</p>
        <t-button theme="primary" @click="retry">重试</t-button>
      </div>
    </GlassCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import GlassCard from './GlassCard.vue'

const errorMessage = ref('')

const retry = () => {
  window.location.reload()
}
</script>

<style scoped>
.error-component {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px;
}

.error-card {
  padding: 32px;
  text-align: center;
  max-width: 400px;
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.error-content h3 {
  font-size: 20px;
  font-weight: 700;
  color: var(--glass-navy);
  margin: 0;
}

.error-content p {
  font-size: 14px;
  color: var(--glass-navy-55);
  margin: 0;
  line-height: 1.5;
}
</style>
