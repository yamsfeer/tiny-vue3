import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    coverage: {
      reporter: ['text']
    }
  },
  build: {
    lib: {
      entry: 'index.js',
      name: 'tine-vue'
    }
  }
})
