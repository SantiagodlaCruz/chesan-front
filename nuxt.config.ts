// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt'
  ],
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'dark',
  },
  vite: {
    server: {
      allowedHosts: [
        'ba8b-201-172-174-52.ngrok-free.app',
        '.ngrok-free.app'
      ]
    }
  },
  tailwindcss: {
    config: {
      theme: {
        extend: {
          colors: {
            primary:           '#3b82f6',
            // Dark mode surfaces
            'background-dark': '#0f172a',
            'card-dark':       '#1e293b',
            'border-dark':     '#334155',
            charcoal:          '#1e293b',
            // Light mode surfaces
            'background-light': '#f6f8fa',
            'card-light':       '#ffffff',
            'border-light':     '#d0d7de',
            'panel-light':      '#f0f4f8',
            // Accents / Status
            'accent-blue':     '#58a6ff',
            'accent-green':    '#3fb950',
            'glow-green':      '#39d353',
            'accent-red':      '#ef4444',
          },
          fontFamily: {
            display: ['Inter', 'sans-serif']
          }
        }
      }
    }
  }
})