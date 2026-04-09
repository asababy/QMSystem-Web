<template>
  <div 
    class="navi-card" 
    @click="$emit('navigate', module.url)"
    :style="customStyle"
  >
    <div class="card-header">
      <div class="card-icon">
        <span class="icon-emoji">{{ module.icon }}</span>
      </div>
      <div class="card-content">
        <h3 class="card-title">{{ module.name }}</h3>
        <p class="card-description">{{ module.description }}</p>
      </div>
      <div class="card-category">
        <span class="category-tag">{{ module.category }}</span>
      </div>
    </div>
    <div class="card-hover-effect"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Module {
  id: string
  name: string
  description: string
  url: string
  icon: string
  category: string
}

const props = defineProps<{
  module: Module
  style?: Record<string, any>
}>()

defineEmits<{
  navigate: [url: string]
}>()

const customStyle = computed(() => props.style || {})
</script>

<style scoped>
.navi-card {
  position: relative;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  animation: fadeInUp 0.6s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.navi-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border-color: rgba(99, 102, 241, 0.5);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 4px 8px rgba(99, 102, 241, 0.3);
  flex-shrink: 0;
}

.icon-emoji {
  font-size: 24px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.card-content {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #f8fafc;
  margin: 0 0 4px 0;
  line-height: 1.3;
}

.card-description {
  font-size: 12px;
  color: #94a3b8;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-category {
  display: flex;
  align-items: center;
  margin-left: auto;
  flex-shrink: 0;
}

.category-tag {
  background: rgba(99, 102, 241, 0.15);
  color: #a5b4fc;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 500;
  border: 1px solid rgba(99, 102, 241, 0.25);
}

.card-hover-effect {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 12px;
}

.navi-card:hover .card-hover-effect {
  opacity: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .navi-card {
    padding: 12px;
  }
  
  .card-header {
    gap: 10px;
  }
  
  .card-icon {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }
  
  .icon-emoji {
    font-size: 20px;
  }
  
  .card-title {
    font-size: 14px;
  }
  
  .card-description {
    font-size: 11px;
  }
  
  .category-tag {
    font-size: 9px;
    padding: 1px 6px;
  }
}
</style>
