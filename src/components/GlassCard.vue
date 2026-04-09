<template>
  <div class="glass-card" :style="cardStyle">
    <div class="glass-card-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  padding?: string | number
  borderRadius?: number
  blurSigma?: number
  backgroundColor?: string
  borderColor?: string
  shadowColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  padding: '20px',
  borderRadius: 24,
  blurSigma: 22,
  backgroundColor: 'rgba(255, 255, 255, 0.38)',
  borderColor: 'rgba(255, 255, 255, 0.4)',
  shadowColor: 'rgba(29, 27, 75, 0.06)'
})

const cardStyle = computed(() => ({
  '--glass-card-padding': typeof props.padding === 'number' 
    ? `${props.padding}px` 
    : props.padding,
  '--glass-card-border-radius': `${props.borderRadius}px`,
  '--glass-card-blur': `${props.blurSigma}px`,
  '--glass-card-bg': props.backgroundColor,
  '--glass-card-border': props.borderColor,
  '--glass-card-shadow': props.shadowColor
}))
</script>

<style scoped>
.glass-card {
  position: relative;
  border-radius: var(--glass-card-border-radius);
  backdrop-filter: blur(var(--glass-card-blur));
  -webkit-backdrop-filter: blur(var(--glass-card-blur));
  background: var(--glass-card-bg);
  border: 1.2px solid var(--glass-card-border);
  box-shadow: 
    0 14px 28px var(--glass-card-shadow),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.glass-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 100%
  );
  opacity: 0.6;
}

.glass-card-content {
  padding: var(--glass-card-padding);
  position: relative;
  z-index: 1;
}

/* 悬停效果 */
.glass-card:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 20px 40px rgba(29, 27, 75, 0.12),
    0 0 0 1px rgba(255, 255, 255, 0.08) inset;
  border-color: rgba(255, 255, 255, 0.5);
}

/* 内部光晕效果 */
.glass-card::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle at center,
    rgba(255, 255, 255, 0.1) 0%,
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.glass-card:hover::after {
  opacity: 1;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .glass-card {
    --glass-card-blur: 18px;
    border-radius: calc(var(--glass-card-border-radius) * 0.9);
  }
}

@media (max-width: 480px) {
  .glass-card {
    --glass-card-blur: 16px;
    border-radius: calc(var(--glass-card-border-radius) * 0.8);
  }
}
</style>
