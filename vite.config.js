import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Relative base works on GitHub Pages and Cloudflare Pages.
export default defineConfig({ plugins: [vue()], base: './' })
