<template>
  <div class="glass-background-layer">
    <!-- 渐变背景 -->
    <div class="gradient-background"></div>
    
    <!-- 装饰性渐变圆圈 -->
    <div class="gradient-blob blob-1"></div>
    <div class="gradient-blob blob-2"></div>
    <div class="gradient-blob blob-3"></div>
  </div>
</template>

<script setup lang="ts">
// 玻璃拟态背景层组件
// 基于 mkvideo_app 的设计风格
</script>

<style scoped>
.glass-background-layer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.gradient-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    var(--glass-canvas-alt) 0%,
    #f4f2fa 50%,
    var(--glass-canvas) 100%
  );
}

.gradient-blob {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.blob-1 {
  top: -90px;
  right: -70px;
  width: 260px;
  height: 260px;
  background: radial-gradient(
    circle at center,
    rgba(155, 143, 217, 0.4) 0%,
    rgba(155, 143, 217, 0) 100%
  );
}

.blob-2 {
  top: 140px;
  left: -110px;
  width: 300px;
  height: 300px;
  background: radial-gradient(
    circle at center,
    rgba(126, 182, 255, 0.4) 0%,
    rgba(126, 182, 255, 0) 100%
  );
}

.blob-3 {
  bottom: 40px;
  right: -50px;
  width: 220px;
  height: 220px;
  background: radial-gradient(
    circle at center,
    rgba(255, 141, 197, 0.4) 0%,
    rgba(255, 141, 197, 0) 100%
  );
}

/* 响应式调整 */
@media (max-width: 768px) {
  .blob-1 {
    width: 200px;
    height: 200px;
    top: -60px;
    right: -50px;
  }
  
  .blob-2 {
    width: 240px;
    height: 240px;
    top: 100px;
    left: -80px;
  }
  
  .blob-3 {
    width: 180px;
    height: 180px;
    bottom: 30px;
    right: -40px;
  }
}

@media (max-width: 480px) {
  .blob-1 {
    width: 160px;
    height: 160px;
    top: -40px;
    right: -30px;
  }
  
  .blob-2 {
    width: 200px;
    height: 200px;
    top: 80px;
    left: -60px;
  }
  
  .blob-3 {
    width: 140px;
    height: 140px;
    bottom: 20px;
    right: -30px;
  }
}
</style>
