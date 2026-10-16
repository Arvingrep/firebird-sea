import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// 同域部署在 /tma/；开发时把 /tg-api 代理到本地 api（同源，无 CORS）
export default defineConfig({
  base: '/tma/',
  plugins: [vue()],
  server: { proxy: { '/tg-api': { target: process.env.TMA_DEV_API || 'http://localhost:3000', changeOrigin: false } } },
  build: { outDir: 'dist', sourcemap: false },
});
