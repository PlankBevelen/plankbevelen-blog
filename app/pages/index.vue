<template>
    <div class="home">
        <div class="container">
            <ThreeColumnLayout :loading="pending">
                <template #left class="left">
                    <BloggerCard :articleCount="stats?.articles || 0" :categoryCount="stats?.categories || 0" :tagCount="stats?.tags || 0" />
                    <RecordLinkCard />
                </template>
                <template #middle>
                    <ArticleList single :articleList="articles"/>
                </template>
                <template #right>
                    <CategoryCard :categories="categories" />
                    <TagCard :tags="tags" />
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
import { computed } from 'vue'
import { useAsyncData } from 'nuxt/app'
import http from '~/utils/http-common'

const { data, pending } = await useAsyncData('home-data', async () => { 
    try {
        const res = await http.get('/api/home.data') as any 
        if(res.status === 200 && res.data.status === 200) {
            console.log('res.data.data', res.data.data)
            return res.data.data
        }else {
            throw Error(res.data.message || '获取首页数据失败')
        }
    } catch (err) {
        throw Error(err.message || '获取首页数据失败')
    }
})

const articles = computed(() => data.value?.articles || [])
const categories = computed(() => data.value?.categories || [])
const tags = computed(() => data.value?.tags || [])
const stats = computed(() => data.value?.stats || null)

// SEO 优化
useHead({
    title: 'PlankBevelen 的博客 - 首页',
    meta: [
        { name: 'description', content: '个人技术博客，分享编程经验和技术文章' },
        { name: 'keywords', content: '博客,技术,编程,开发' }
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
</style>
