// https://nuxt.com/docs/api/configuration/nuxt-config

import viteCompression from 'vite-plugin-compression'
import { t } from './app/components/i18n/index'

export default defineNuxtConfig({
  compatibilityDate: '2025-09-15',
  devtools: { enabled: true },
  css: ['@/assets/css/global.less', '@/assets/css/theme.less', '@/assets/css/variables.less'],
  modules: ['nuxt-icons', '@pinia/nuxt', '@nuxt/image', '@nuxtjs/seo', '@element-plus/nuxt'],
  site: {
    url: 'https://plankbevelen.cn',
    name: t('common.title'),
    description: t('site.description'),
    defaultLocale: 'zh-CN',
  },
  sitemap: {
    sources: [
      '/api/sitemap-urls'
    ],
    exclude: ['/admin/**'],
    xsl: false,
    credits: false,
  },
  robots: {
    allow: ['/'],
    disallow: ['/admin/**'],
    sitemap: 'https://plankbevelen.cn/sitemap.xml',
  },
  app: {
    head: {
      htmlAttrs: {
        lang: 'zh-CN'
      },
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/webp', href: '/img/logo.webp' },
        { rel: 'apple-touch-icon', href: '/img/logo.webp' }
      ],
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'format-detection', content: 'telephone=no' }
      ]
    }
  },
  runtimeConfig: {  
    public: {
      baseUrl: process.env.NUXT_BASE_URL || '/',
      cookiePrefix: process.env.NUXT_PUBLIC_COOKIE_PREFIX || '',
      expirationTime: process.env.NUXT_EXPIRATION_TIME || '432000',
      keepAliveTime: process.env.NUXT_KEEP_ALIVE_TIME || '432000',
    }
  },
  ssr: true,
  postcss: {
    plugins: {
      'postcss-preset-env': {
        stage: 1,
        features: {
          'nesting-rules': true
        }
      },
      autoprefixer: {},
      'postcss-pxtorem': {
        rootValue: 24,
        propList: ['*'],
        selectorBlackList: ['.norem', 'html'],
        unitPrecision: 5, // 转换后的精度，即小数点位数
        replace: true,  // 是否直接更换属性值而不添加备份属性
        mediaQuery: false,  // 是否在媒体查询中也转换px为rem
        minPixelValue: 0 // 设置要转换的最小像素值
      }
    }
  },
  vite: {
    plugins: [
      viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240,
        algorithm: 'gzip',
        ext: '.gz',
      })
    ],
    css: {
      preprocessorOptions: {
        less: {
          additionalData: '@import "@/assets/css/global.less"; @import "@/assets/css/theme.less"; @import "@/assets/css/variables.less";',
          javascriptEnabled: true,
        }
      }
    },
    build: {
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('md-editor-v3')) {
                return 'md-editor-v3'
              }
            }
          }
        }
      }
    }
  },
  image: {
    provider: 'ipx',
    ipx: {
      baseURL: '/_ipx',
      maxAge: 60 * 60 * 24 * 365,
      format: ['webp', 'avif', 'png', 'jpg'],
      modifiers: {
        quality: 80
      },
    },
    domains: ['plankbevelen.cn', 'localhost', '127.0.0.1'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536
    }
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/sitemap.xml', '/robots.txt']
    },
    externals: {
      inline: ['element-plus', '@popperjs/core']
    },
    // 压缩静态资源
    serveStatic: true,
    compressPublicAssets: true,
  },
})
