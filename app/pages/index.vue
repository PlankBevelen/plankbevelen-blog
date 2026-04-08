<template>
  <div class="min-h-screen pt-header">
    <div class="container py-page">
      <h1 class="sr-only">PlankBevelen (Plank / Bevelen) 的个人博客</h1>
      <LayoutThreeColumn :loading="pending">
        <template #left class="left">
          <WidgetBlogger :articleCount="homeData.stats?.articles " :categoryCount="homeData.stats?.categories" :tagCount="homeData.stats?.tags" />
          <WidgetRecordLink />
        </template>
        <template #middle>
          <keep-alive>
            <ArticleList single :articleList="homeData.articles" />
          </keep-alive>
        </template>
        <template #right>
          <WidgetLatest :articles="homeData.latestArticles" />
          <WidgetCategory :categories="homeData.categories" @select="onSelectCategory"/>
          <WidgetTag :tags="homeData.tags" />
        </template>
      </LayoutThreeColumn>
    </div>        
  </div>
</template>

<script setup lang="ts">
import { useAsyncData } from 'nuxt/app'
import http from '~/utils/http'
import { SITE_URL, SITE_AUTHOR, usePageSeo } from '@/composables/useSeo'
import { useSidebarData } from '@/composables/useSidebarData'

const localePath = useLocalePath()
const { t } = useI18n()

const homeData = reactive({
  articles: [],
  latestArticles: [],
  categories: [],
  tags: [],
  stats: null
})

const { data: sidebarData } = await useSidebarData()

const { data, pending } = await useAsyncData('home-data', async () => { 
  try {
    const res = await http.get('/home.data') as any 
    if(res.status === 200) {
        return res.data
    }else {
        throw Error(res.msg || '获取首页数据失败')
    }
  } catch (err: any) {
    throw Error(err.message || '获取首页数据失败')
  }
})

const onSelectCategory = async (item: any) => {
  const target = localePath('/article')
  await navigateTo({ path: target, query: { category: item.name } })
}

watch(sidebarData, (newData) => {
  if (newData) {
    homeData.latestArticles = newData.latestArticles || []
    homeData.categories = newData.categories || []
    homeData.tags = newData.tags || []
    homeData.stats = newData.stats || null
  }
}, { immediate: true, deep: true })

watch(data, (newData) => {
  if (newData) {
    homeData.articles = newData.articles || []
  }
}, { immediate: true, deep: true })

// ld+json：首页专属，告诉搜索引擎网站基本信息和搜索入口
const siteLdJson = computed(() => JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: t('site.name'),
  url: SITE_URL,
  publisher: {
    '@type': 'Person',
    name: SITE_AUTHOR,
    alternateName: ['Plank', 'Bevelen'],
    url: SITE_URL,
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/article?q={search_term_string}`,
    'query-input': 'required name=search_term_string'
  }
}))

// SEO
// 首页 title 不走 titleTemplate（避免变成"首页 | PlankBevelen | PlankBevelen"）
// canonical 由 app.vue 统一生成 SITE_URL + route.path，首页路径是 /，结果正确，无需重复写
usePageSeo({
  title: t('pages.home.title'),
  description: t('pages.home.meta.description'),
  keywords: t('pages.home.meta.keywords'),
})
 
useHead({
  titleTemplate: '', // 首页清空模板，title 直接输出不拼接后缀
  script: [
    {
      key: 'home-ld',
      type: 'application/ld+json',
      children: siteLdJson.value,
    }
  ]
})
</script>