import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  build: {
    // Принудительный cache busting
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash]-v${Date.now()}.js`,
        chunkFileNames: `assets/[name]-[hash]-v${Date.now()}.js`,
        assetFileNames: `assets/[name]-[hash].[ext]`,
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia'],
          'maps': ['leaflet', 'leaflet.markercluster'],
          'utils': ['axios', 'dayjs', 'qrcode']
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true
      }
    },
    chunkSizeWarningLimit: 600
  }
})

