import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    dts({
      include: ['src'],
      exclude: ['src/**/*.test.ts', 'src/test/**'],
      outDir: 'dist',
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'LumenUI',
      formats: ['es', 'umd'],
      fileName: (format) => (format === 'es' ? 'lumen-ui.js' : 'lumen-ui.umd.cjs'),
    },
    rollupOptions: {
      // Vue is a peer dependency — never bundle it.
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
