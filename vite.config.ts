import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      // Route /api/* → http://20.207.122.201/evaluation-service/*
      // The browser sends Authorization header directly; the proxy only fixes
      // the CORS issue where the remote returns duplicate Allow-Origin headers.
      '/api': {
        target: 'http://20.207.122.201',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/evaluation-service'),
        configure: (proxy) => {
          // Fix: remote server returns multiple Access-Control-Allow-Origin
          // values which Chrome rejects — normalise to a single value.
          proxy.on('proxyRes', (proxyRes) => {
            proxyRes.headers['access-control-allow-origin'] = '*'
            delete proxyRes.headers['access-control-allow-credentials']
          })
        },
      },
    },
  },
})
