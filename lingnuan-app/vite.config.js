// uni-app (Vue3) Vite 构建配置
// 运行：npm run dev:h5 / npm run build:h5
import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';

export default defineConfig({
  plugins: [uni()],
  server: {
    port: 5714,
    host: '0.0.0.0'
  },
  build: {
    outDir: 'dist/build/h5',
    sourcemap: false,
    chunkSizeWarningLimit: 1500
  }
});
