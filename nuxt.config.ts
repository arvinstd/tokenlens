// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/google-fonts',
  ],

  googleFonts: {
    families: {
      Inter: [400, 450, 500, 600, 650, 700, 750, 800],
    },
    display: 'swap',
  },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'TokenLens',
      meta: [
        { name: 'description', content: 'Your design system\'s health score. Figma ↔ Code, always in sync.' },
      ],
    },
  },
})
