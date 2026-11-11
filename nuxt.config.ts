// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  compatibilityDate: '2025-09-15',
  devtools: { enabled: process.env.NODE_ENV === 'development' },
  css: ['@/assets/css/tailwind.css', '@/assets/css/variables.less', '@/assets/css/theme.less', '@/assets/css/reset.less', '@/assets/css/element-plus.less', '@/assets/css/components.less', '@/assets/css/admin.less'],
  modules: ['@pinia/nuxt', '@nuxt/image', '@nuxtjs/seo', '@element-plus/nuxt', '@nuxtjs/i18n', '@nuxtjs/tailwindcss'],
  ssr: true,
  // i18n 
  i18n: {
    locales: [
      { code: 'zh', file: 'zh.json', name: '中文' },
      { code: 'en', file: 'en.json', name: 'English' }
    ],
    defaultLocale: 'zh',
    langDir: 'locales',
    strategy: 'prefix_except_default',
    // 关闭自动语言探测，避免每个 HTML 响应都带 i18n_redirected，否则 Cloudflare 不会缓存文档
    detectBrowserLanguage: false,
  },
  // seo优化
  site: {
    url: 'https://plankbevelen.cn',
    name: 'plankbevelen 的个人博客',
    separator: '—',
    description: 'plankbevelen的个人博客',
    defaultLocale: 'zh',
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
  // 全局head配置
  app: {
    head: {
      htmlAttrs: {
        lang: 'zh'
      },      
      title: 'plankbevelen',
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/img/logo.webp' }
      ],
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'author', content: 'plankbevelen' },
        { name: 'baidu-site-verification', content: 'codeva-sJBNhZ2pRR' },
      ]
    }
  },
  runtimeConfig: {  
    authSecret: process.env.NUXT_AUTH_SECRET || '',
    public: {
      baseUrl: process.env.NUXT_BASE_URL || '/',
      agentHealthUrl: process.env.NUXT_PUBLIC_AGENT_HEALTH_URL || 'http://127.0.0.1:6543/health',
      agentChatUrl: process.env.NUXT_PUBLIC_AGENT_CHAT_URL || 'http://127.0.0.1:6543/chat',
      cookiePrefix: process.env.NUXT_PUBLIC_COOKIE_PREFIX || 'plankbevelen_',
      expirationTime: process.env.NUXT_EXPIRATION_TIME || '43200',
      keepAliveTime: process.env.NUXT_KEEP_ALIVE_TIME || '604800',
    }
  },  
  postcss: {
    plugins: {
      tailwindcss: {},
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
    css: {
      preprocessorMaxWorkers: 0,
      preprocessorOptions: {
        less: {
          additionalData: '@import "@/assets/css/variables.less";',
          javascriptEnabled: true,
        }
      }
    },
    build: {
      chunkSizeWarningLimit: 1500,
      sourcemap: false,
      reportCompressedSize: false,  
    },
  },
  image: {
    provider: 'ipx',
    ipx: {
      baseURL: '/_ipx',
      maxAge: 60 * 60 * 24 * 365,
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
  routeRules: {
    '/admin/**': { headers: { 'cache-control': 'private, no-store', 'cdn-cache-control': 'private, no-store' } },
    '/api/**': { headers: { 'cache-control': 'private, no-store', 'cdn-cache-control': 'private, no-store' } },
    '/**': {
      headers: {
        'cache-control': 'public, max-age=0, must-revalidate',
        'cdn-cache-control': 'public, s-maxage=300, stale-while-revalidate=86400',
      },
    },
  },
  nitro: {
    prerender: {
      crawlLinks: false,
      routes: []
    },
    externals: {
      inline: ['element-plus', '@popperjs/core']
    },
    serveStatic: true,
    compressPublicAssets: false, 
    esbuild: {
      options: {
        target: 'node20',
      },
    },
  },
})
