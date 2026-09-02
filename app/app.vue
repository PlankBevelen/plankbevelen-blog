<template>
  <el-config-provider :locale="elLocale" :z-index="3000">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </el-config-provider>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAdminStore } from '@/stores/admin.store'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
import { SITE_URL, SITE_IMAGE } from '@/composables/useSeo'

// 仅在管理员路由需要时动态加载并配置 md-editor，避免将其拉入首页主包
onMounted(async () => {
  try {
    const route = useRoute()
    if (route.path.startsWith('/admin')) {
      const md = await import('md-editor-v3')
      if (md?.config) {
        md.config({
          editorExtensions: {
            highlight: { js: '' },
            echarts: { js: '' },
            katex: { js: '', css: '' },
            cropper: { js: '', css: '' },
          }
        })
      }
    }
  } catch (e) {
    // 忽略动态加载失败，不影响首页渲染
  }
})

const admin = useAdminStore()
const elLocale = computed(() => admin.getLocale === 'en' ? en : zhCn)

const { locale } = useI18n()
const route = useRoute()
const switchLocalePath = useSwitchLocalePath()

// canonical 响应式，随路由变化自动更新，所有页面通用
// 文章详情页会在页面级覆盖此值
const canonicalUrl = computed(() => `${SITE_URL}${route.path || '/'}`)

// 语言互链（hreflang）与 og:locale：zh 为默认语言（无前缀），en 带 /en 前缀
const ogLocale = computed(() => (locale.value === 'en' ? 'en_US' : 'zh_CN'))
const hreflangZh = computed(() => `${SITE_URL}${switchLocalePath('zh')}`)
const hreflangEn = computed(() => `${SITE_URL}${switchLocalePath('en')}`)

// 全局兜底: og 通用字段，页面级 useSeoMeta 会自动覆盖 title/description
useSeoMeta({
  ogType: 'website',
  ogSiteName: 'plankbevelen',
  ogImage: SITE_IMAGE,
  ogUrl: () => canonicalUrl.value,
  ogLocale: () => ogLocale.value,
  twitterCard: 'summary_large_image',
  twitterImage: SITE_IMAGE,
})

// lang、canonical、hreflang、og:locale:alternate 响应式，跟随路由和语言变化
useHead(() => ({
  htmlAttrs: { lang: locale.value },
  meta: [
    { property: 'og:locale:alternate', content: 'zh_CN' },
    { property: 'og:locale:alternate', content: 'en_US' },
  ],
  link: [
    { rel: 'canonical', href: canonicalUrl.value, key: 'canonical' },
    { rel: 'alternate', hreflang: 'zh-CN', href: hreflangZh.value, key: 'hreflang-zh' },
    { rel: 'alternate', hreflang: 'en', href: hreflangEn.value, key: 'hreflang-en' },
    { rel: 'alternate', hreflang: 'x-default', href: hreflangZh.value, key: 'hreflang-x-default' },
  ],
}))
</script>


