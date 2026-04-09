import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

const qiankunHtmlCompatPlugin = () => ({
  name: 'qiankun-html-compat',
  transformIndexHtml(html: string) {
    // 避免生命周期函数无法被主应用识别
    return html.replace(/<script\s+type="module"\s+/g, '<script ')
  },
})

export default defineConfig(({ command }) => ({
  plugins: command === 'build' ? [vue(), qiankunHtmlCompatPlugin()] : [vue()],
  base: command === 'serve' ? '/' : '/quality/',
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
        format: 'iife', // 微前端必须 IIFE 格式
        inlineDynamicImports: true, // 微前端需要内联
        entryFileNames: 'assets/qm-system.js',
        assetFileNames: 'assets/[name]-[hash][extname]',
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
    proxy: {
      '/api': {
        target: 'http://localhost:7701',
        changeOrigin: true,
      },
      '/api/qm': {
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
