// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      apiBaseUrl: 'http://127.0.0.1:8000'
    }
  },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt'
  ],
  piniaPluginPersistedstate: {
    cookieOptions: {
      sameSite: 'lax',
    },
    storage: 'cookies'
  },
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
          },
          keyframes: {
            'pulse-soft': {
              '0%, 100%': { opacity: '1', transform: 'scale(1)' },
              '50%': { opacity: '0.7', transform: 'scale(0.96)' },
            }
          },
          animation: {
            'pulse-soft': 'pulse-soft 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }
        }
      }
    }
  }
})