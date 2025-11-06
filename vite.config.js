import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    host: true,
  },
  build: {
    sourcemap: false, // 프로덕션 빌드에서 소스맵 비활성화 (커밋 정보 노출 방지)
    minify: 'esbuild', // esbuild 사용 (기본값, 더 빠름)
  },
})


