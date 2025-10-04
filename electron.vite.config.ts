import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        output: {
          format: 'es',
          entryFileNames: '[name].js'
        }
      }
    },
    resolve: {
      alias: {
        '@main': resolve('src/main'),
        '@preload': resolve('src/preload')
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@main': resolve('src/main'),
        '@preload': resolve('src/preload'),
        '@renderer': resolve('src/renderer/src'),
        '@': resolve('src/renderer/src')
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@preload': resolve('src/preload'),
        '@renderer': resolve('src/renderer/src'),
        '@': resolve('src/renderer/src')
      }
    },
    plugins: [react(), tailwindcss()],
    build: {
      minify: true,
      sourcemap: true,
      rollupOptions: {
        input: {
          main: resolve('src/renderer/index.html')
        }
      }
    }
  }
})
