<template>
    <div class="article">
        <div class="container">
            <ThreeColumnLayout :loading="homePending">
                <template #left>
                    <BloggerCard :articleCount="stats?.articles || 0" :categoryCount="stats?.categories || 0" :tagCount="stats?.tags || 0" />
                    <RecordLinkCard />
                </template>
                <template #middle>
                    <Card class="navBar">
                        <div class="breadcrumb">
                            <NuxtLink to="/">首页</NuxtLink>
                            <span> / </span>
                            <NuxtLink to="/article">文章</NuxtLink>
                        </div>
                        <div class="searchArea">
                            <el-input v-model="keyword" placeholder="搜索" clearable prefix-icon="el-icon-search" />
                        </div>
                    </Card>
                    <ArticleList :q="keyword" />                    
                </template>
                <template #right>
                    <CategoryCard />
                    <TagCard />
                </template>
            </ThreeColumnLayout>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { navigateTo, useAsyncData, useHead } from 'nuxt/app'
import Card from '@/components/cards/card.vue'
import ArticleList from '@/components/article/articleList.vue'
import CategoryCard from '@/components/cards/category.vue'
import TagCard from '@/components/cards/tag.vue'
import ThreeColumnLayout from '~/components/layouts/ThreeColumnLayout.vue'
import BloggerCard from '@/components/cards/blogger.vue'
import RecordLinkCard from '@/components/cards/recordLink.vue'
import http from '~/utils/http-common'

const keyword = ref('')

const route = useRoute()
keyword.value = String(route.query.q || '')

const { data: homeData, pending: homePending } = await useAsyncData('article-page-home-data', async () => { 
    const res = await http.get('/api/home.data') as any 
    if(res.status === 200 && res.data.status === 200) {
        return res.data.data
    }
    return null
})

const stats = computed(() => homeData.value?.stats || null)

const onSearch = async () => {
    await navigateTo({ path: '/article', query: { q: keyword.value || undefined } })
}

useHead({
    title: '文章列表',
    meta: [
        { name: 'description', content: '文章列表与搜索' }
    ]
})

</script>

<style lang="less" scoped>
.article {
    min-height: 100vh;
    padding-top: @header-height;
    .container {
        padding: 40px 0;
    }
}
</style>
