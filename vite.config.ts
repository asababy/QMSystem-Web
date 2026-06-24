import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import qiankun from 'vite-plugin-qiankun'
import { resolve } from 'path'

export default defineConfig(({ command }) => ({
  plugins: [
    vue(),
    qiankun('qm-system', { useDevMode: true })
  ],
  base: command === 'serve' ? '/' : '/qm/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    // 重点：将编译产物直接输出到 C# 项目的静态资源目录
    outDir: '../QMSystem/WebPages',
    emptyOutDir: true, // 每次构建前清空旧产物，避免遗留历史 hash 文件
    modulePreload: false,
    cssCodeSplit: false,
    // 生产标准：微前端稳定配置，依赖 qiankun 桥接层解决样式隔离
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
      output: {
        format: 'es', // 微前端 ESM 格式，启用代码分割
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        manualChunks: {
          tdesign: ['tdesign-vue-next'],
          vue: ['vue', 'vue-router', 'pinia', 'vue-i18n'],
        }
      },
    },
  },
  css: {
    // 使用现代 SASS API，消除 legacy-js-api 警告
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler'
      }
    }
  },
  server: {
    host: '0.0.0.0',  // 允许局域网访问，启动时会显示 Network 地址
    port: 5173,       // 开发时使用5173端口
    cors: true,       // 【必须】允许跨域
    headers: {        // 【必须】qiankun 主应用需要通过 fetch 请求微应用资源
      'Access-Control-Allow-Origin': '*'
    },
    proxy: {
      '/api': {
        target: 'http://localhost:7701',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:7701',
        ws: true,
      },
    }
  },
}))
