<template>
  <div class="home">
    <div class="container">
      <h1 class="seo-hidden-title">PlankBevelen (Plank / Bevelen) 的个人博客</h1>
      <ThreeColumnLayout :loading="pending">
        <template #left class="left">
          <BloggerCard :articleCount="homeData.stats?.articles " :categoryCount="homeData.stats?.categories" :tagCount="homeData.stats?.tags" />
          <RecordLinkCard />
        </template>
        <template #middle>
          <keep-alive>
            <ArticleList single :articleList="homeData.articles"/>
          </keep-alive>
        </template>
        <template #right>
          <LatestArticlesCard :articles="homeData.latestArticles" />
          <CategoryCard :categories="homeData.categories" @select="onSelectCategory"/>
          <TagCard :tags="homeData.tags" />
        </template>
      </ThreeColumnLayout>
    </div>        
  </div>
</template>

<script setup lang="ts">
import ThreeColumnLayout from '@/components/layouts/ThreeColumnLayout.vue'
import BloggerCard from '@/components/cards/blogger.vue'
import RecordLinkCard from '@/components/cards/recordLink.vue'
import ArticleList from '@/components/article/articleList.vue'
import CategoryCard from '@/components/cards/category.vue'
import TagCard from '@/components/cards/tag.vue'
import LatestArticlesCard from '@/components/article/latest.vue'
import { useAsyncData } from 'nuxt/app'
import http from '~/utils/http'
import { SITE_URL, SITE_AUTHOR, usePageSeo } from '@/composables/useSeo'

const localePath = useLocalePath()
const { t } = useI18n()

const homeData = reactive({
  articles: [],
  latestArticles: [],
  categories: [],
  tags: [],
  stats: null
})

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

watch(data, (newData) => {
  if (newData) {
    homeData.articles = newData.articles || []
    homeData.latestArticles = newData.latestArticles || []
    homeData.categories = newData.categories || []
    homeData.tags = newData.tags || []
    homeData.stats = newData.stats || null
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

<style lang="less" scoped>
.home {
    min-height: 100vh;
    padding-top: @header-height;
    .container {
        padding: 40px 0;
    }
}
.seo-hidden-title {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
