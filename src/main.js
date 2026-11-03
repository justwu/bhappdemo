import { createApp } from 'vue'

// The interactive demo is implemented using Vue 3's compiled-in-browser template.
// Keep the global bridge small so Vite can bundle Vue instead of loading a CDN.
window.Vue = { createApp }
import('../app.js')
