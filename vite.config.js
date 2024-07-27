import { defineConfig } from 'vite'
import glsl from 'vite-plugin-glsl'

export default defineConfig({
  plugins: [
    glsl(),
  ],
  worker: {
    format: 'es'
  },
  resolve: {
    alias: {
      'comlink': 'comlink/dist/esm/comlink.mjs'
    }
  }
})