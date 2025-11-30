<template>
    <div class="about">
        <div class="container">
            <ThreeColumnLayout :loading="pending">
                <template #left>
                    <BloggerCard :articleCount="stats?.articles || 0" :categoryCount="stats?.categories || 0" :tagCount="stats?.tags || 0" />
                    <RecordLinkCard />
                </template>
                <template #middle>
                    <Card class="navBar">
                        <div class="breadcrumb">
                            <NuxtLink to="/">首页</NuxtLink>
                            <span> / </span>
                            <NuxtLink to="/about">关于</NuxtLink>
                        </div>
                    </Card>
                    <Card class="aboutContent">
                        <div class="title">关于我</div>
                        <div class="content">
                            <p>这里是我的个人技术博客。我关注前端工程化、后端实践与产品设计，记录一些有用的技术笔记与思考。</p>
                            <p>本站以简洁为主，首页展示最新文章、分类与标签云。你也可以在文章页使用搜索功能快速定位内容。</p>
                            <p>欢迎交流与指出问题。如果你喜欢某篇文章，别忘了分享给你的朋友。</p>
                        </div>
                    </Card>
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
import { computed } from 'vue'
import { useAsyncData, useHead } from 'nuxt/app'
import ThreeColumnLayout from '@/components/layouts/ThreeColumnLayout.vue'
import BloggerCard from '@/components/cards/blogger.vue'
import RecordLinkCard from '@/components/cards/recordLink.vue'
import CategoryCard from '@/components/cards/category.vue'
import TagCard from '@/components/cards/tag.vue'
import Card from '@/components/cards/card.vue'
import http from '~/utils/http-common'

const { data, pending } = await useAsyncData('about-home-data', async () => {
    const res = await http.get('/api/home.data') as any
    if (res.status === 200 && res.data.status === 200) {
        return res.data.data
    }
    return null
})

const stats = computed(() => data.value?.stats || null)

useHead({
    title: '关于我',
    meta: [
        { name: 'description', content: '关于本站与作者的介绍' }
    ]
})
</script>

<style lang="less" scoped>
.about {
    min-height: 100vh;
    padding-top: @header-height;
    .container { padding: 40px 0; }
}
.navBar { margin-bottom: 20px; }
.aboutContent {
    display: flex;
    flex-direction: column;
    gap: 16px;
}
.aboutContent .title {
    font-size: 24px;
    font-weight: 500;
    color: var(--primary-color);
}
.aboutContent .content { color: var(--text-color); font-size: 14px; line-height: 1.8; }
</style>
