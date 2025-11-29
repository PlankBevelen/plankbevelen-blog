// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['element-plus/dist/index.css', '@/assets/css/global.less', '@/assets/css/theme.less', '@/assets/css/variables.less'],
  modules: ['nuxt-icons', '@pinia/nuxt'],
  runtimeConfig: {
    public: {
      baseUrl: process.env.NUXT_BASE_URL || '/',
      cookiePrefix: process.env.NUXT_PUBLIC_COOKIE_PREFIX || '',
      expirationTime: process.env.NUXT_EXPIRATION_TIME || '432000',
      keepAliveTime: process.env.NUXT_KEEP_ALIVE_TIME || '432000',
    },
  },
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
        rootValue: 16,
        propList: ['*'],
        selectorBlackList: ['.norem'],
        unitPrecision: 5, // 转换后的精度，即小数点位数
        replace: true,  // 是否直接更换属性值而不添加备份属性
        mediaQuery: false,  // 是否在媒体查询中也转换px为rem
        minPixelValue: 0 // 设置要转换的最小像素值
      }
    }
  },
  vite: {
    css: {
      preprocessorOptions: {
        less: {
          additionalData: '@import "@/assets/css/global.less"; @import "@/assets/css/theme.less"; @import "@/assets/css/variables.less";',
          javascriptEnabled: true,
        }
      }
    }
  }
})
