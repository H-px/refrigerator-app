import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/refrigerator-app/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['refrigerator_app_icon.png'],
      manifest: {
        name: '我的冰箱 🧊',
        short_name: '我的冰箱',
        description: '冰箱库存管理与过期提取应用',
        theme_color: '#F0F4F8',
        icons: [
          {
            src: 'refrigerator_app_icon.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'refrigerator_app_icon.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
