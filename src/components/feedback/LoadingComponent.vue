<template>
  <div class="loading-component">
    <div class="loading-content">
      <t-loading text="正在加载组件..." size="large" />
      <p class="loading-text">请稍候，组件正在加载中...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// 加载组件
</script>

<style scoped>
.loading-component {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px;
}

.loading-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-text {
  font-size: 14px;
  color: var(--glass-navy-55);
  margin: 0;
  font-weight: 500;
}
</style>
