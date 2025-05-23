import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import compression from 'vite-plugin-compression'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Загрузка переменных окружения
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      vue(),
      // Создание gzip сжатых файлов для продакшена
      compression({
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 10240, // Файлы больше 10KB будут сжаты
      }),
      // Анализ размера бандла (только при сборке с флагом --analyze)
      process.env.ANALYZE === 'true' ? visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
        filename: 'dist/stats.html'
      }) : null,
    ].filter(Boolean),
    
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:5000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    
    build: {
      // Минификация кода
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production', // Удаление console.log в продакшен сборке
          drop_debugger: mode === 'production' // Удаление debugger в продакшен сборке
        }
      },
      // Разделение кода на чанки
      rollupOptions: {
        output: {
          // Разделение чанков по категориям для оптимизации кэширования
          manualChunks: {
            'vue-vendor': ['vue', 'vue-router', 'pinia'],
            'ui-vendor': ['@vueuse/core'],
            'editor': ['codemirror']
          },
          // Настройка имен файлов
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash].[ext]'
        }
      },
      // Генерация source maps только в dev режиме
      sourcemap: mode !== 'production',
      // Очистка выходной директории перед сборкой
      emptyOutDir: true,
      // Предварительная обработка CSS
      cssCodeSplit: true
    },
    
    test: {
      globals: true,
      environment: 'jsdom',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html', 'json', 'lcov'],
        exclude: [
          'node_modules/',
          'src/assets/',
          'dist/',
          '**/*.d.ts',
          '**/*.spec.ts',
          'vite.config.js'
        ]
      }
    },
    
    // Настройка плагинов во время разработки
    optimizeDeps: {
      include: ['vue', 'vue-router', 'pinia', '@vueuse/core', 'axios'],
      exclude: []
    }
  }
})
