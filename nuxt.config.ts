// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode'
  ],
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'dark',
  },
  tailwindcss: {
    config: {
      theme: {
        extend: {
          colors: {
            primary:           '#3b82f6',
            // Dark mode surfaces
            'background-dark': '#0d1117',
            'card-dark':       '#161b22',
            'border-dark':     '#30363d',
            charcoal:          '#21262d',
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