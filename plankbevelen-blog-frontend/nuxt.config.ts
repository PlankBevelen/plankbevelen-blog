// https://nuxt.com/docs/api/configuration/nuxt-config
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import path from 'path'

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  ssr: true,
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt'
  ],
  nitro: {
    devProxy: {
      '/api': {
        target: 'http://localhost:4008',
        changeOrigin: true,
        prependPath: true,
      }
    },
    routeRules: {
      '/api/**': {
        proxy: 'http://localhost:4008'
      }
    }
  },
  app: {
    rootId: 'app',
    head: {
      title: 'Plankbevelen Blog',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Plankbevelen个人博客，分享技术文章、生活感悟和学习笔记' },
        { name: 'keywords', content: 'blog,博客,技术,文章,plankbevelen' },
        { name: 'author', content: 'Plankbevelen' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },
  routeRules: {
    '/': { redirect: 'home'},
  },
  vite: {
    plugins: [
      createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), 'assets/svg')]
      })
    ]
  },
  css: [
    '@/assets/styles/base.css',
    '@/assets/styles/main.css',
    '@/assets/styles/common.less',
    'element-plus/dist/index.css'
  ]
})
