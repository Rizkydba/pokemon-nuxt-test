// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'Pokémon Nuxt App',
      meta: [
        { name: 'description', content: 'Simple Pokémon app built with Nuxt 3' }
      ],
      link: [{ rel: 'icon', type: 'image/png', href: '/favicon.png' }]
    }
  },
  css: ['@/assets/css/main.css'],
  typescript: {
  strict: false
},
})
