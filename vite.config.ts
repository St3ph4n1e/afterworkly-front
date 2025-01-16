import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import Components from 'unplugin-vue-components/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    Components({
      dirs: ['src/assets/vue/components'], // Dossier où chercher les composants
      extensions: ['vue'],
      deep: true,
      dts: 'src/components.d.ts',
    }),
  ],
  css: {
    postcss: './postcss.config.cjs', // Tailwind sera automatiquement intégré
  },

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@images': fileURLToPath(new URL('./src/assets/images', import.meta.url)),
    },
  },
})
