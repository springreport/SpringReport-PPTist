import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base: 'SpringReport-PPTist',
  plugins: [
    vue(),
  ],
  server: {
    host: 'localhost',
    port: 8080, // 端口
    proxy: {
        '/SpringReport-PPTist/api': { // 请求接口中要替换的标识
            target: 'http://localhost:9099/springReport', // 代理地址
            changeOrigin: true, // 是否允许跨域
            secure: true,
            rewrite: (path) => path.replace(/^\/SpringReport-PPTist/, '').replace(/^\/api/, '/api') // api标志替换为''
        }
    }
},
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import '@/assets/styles/variable.scss';
          @import '@/assets/styles/mixin.scss';
        `
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
