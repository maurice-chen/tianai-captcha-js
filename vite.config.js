import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: './lib/tianai-captcha.js',
      name: 'Tianai Captcha JS SDK',
      fileName: 'tianai-captcha'
    }
  },
  server:{
    proxy:{
      '/api':{
        target:'http://localhost:8080',
        changeOrigin:true,
        rewrite:(path) => path.replace(/^\/api/, '')
      }
    }
  }
})