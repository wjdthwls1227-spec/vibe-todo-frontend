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
    rollupOptions: {
      output: {
        // 주석 완전히 제거
        compact: true,
        // 번들 파일명에서 해시만 사용 (커밋 정보 제거)
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // 빌드 메타데이터 최소화
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
  },
  // 환경변수에서 커밋 정보 제거
  define: {
    // Vercel이 주입하는 커밋 정보 제거
    'process.env.VERCEL_GIT_COMMIT_SHA': JSON.stringify(''),
    'process.env.VERCEL_GIT_COMMIT_REF': JSON.stringify(''),
  },
})


