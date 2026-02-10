<template>
    <div class="home">
        <div class="container">
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
import { t } from '@/components/i18n/index'

const homeData = reactive({
    articles: [],
    latestArticles: [],
    categories: [],
    tags: [],
    stats: null
})

const { data, pending } = await useAsyncData('home-data', async () => { 
    try {
        const res = await http.get('/api/home.data') as any 
        if(res.status === 200 && res.data.status === 200) {
            return res.data.data
        }else {
            throw Error(res.data.message || '获取首页数据失败')
        }
    } catch (err) {
        throw Error(err.message || '获取首页数据失败')
    }
})

const onSelectCategory = async (item: any) => {
    await navigateTo({ path: '/article', query: { category: item.name } })
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

useHead({
    title: t('pages.home.title'),
    meta: [
        { name: 'description', content: t('pages.home.meta.description') },
        { name: 'keywords', content: t('pages.home.meta.keywords') }
    ]
})

useHead({
    script: [
        {
            type: 'application/ld+json',
            children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "PlankBevelen Blog",
                "url": "https://plankbevelen.cn",
                "author": {
                    "@type": "Person",
                    "name": "PlankBevelen",
                    "url": "https://plankbevelen.cn"
                },
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://plankbevelen.cn/article?keyword={search_term_string}",
                    "query-input": "required name=search_term_string"
                }
            })
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
