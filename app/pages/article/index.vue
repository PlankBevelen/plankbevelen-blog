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
                            <NuxtLink to="/article">{{ $t('pages.article.title') }}</NuxtLink>
                            <template v-if="breadcrumbSuffix">
                                <span> / </span>
                                <span>{{ breadcrumbSuffix }}</span>
                            </template>
                        </div>
                        <div class="searchArea">
                            <el-input v-model="keyword" :placeholder="$t('pages.article.search.placeholder')" clearable />
                            <el-button type="primary" @click="onSearch">{{ $t('pages.article.search.btn') }}</el-button>
                        </div>
                    </Card>
                    <ArticleList :q="currentQuery" />                    
                </template>
                <template #right>
                    <CategoryCard @select="onSelectCategory" />
                    <TagCard />
                </template>
            </ThreeColumnLayout>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { navigateTo, useAsyncData, useHead } from 'nuxt/app'
import { t } from '@/components/i18n/index'
import Card from '@/components/cards/card.vue'
import ArticleList from '@/components/article/articleList.vue'
import CategoryCard from '@/components/cards/category.vue'
import TagCard from '@/components/cards/tag.vue'
import ThreeColumnLayout from '~/components/layouts/ThreeColumnLayout.vue'
import BloggerCard from '@/components/cards/blogger.vue'
import RecordLinkCard from '@/components/cards/recordLink.vue'
import http from '~/utils/http'

const keyword = ref('')

const route = useRoute()
keyword.value = String(route.query.q || '')

const currentQuery = computed(() => {
    const cat = String(route.query.category || '')
    if (cat) return cat
    return String(route.query.q || '')
})

const breadcrumbSuffix = computed(() => {
    const cat = String(route.query.category || '')
    if (cat) return `${cat}`
    const q = String(route.query.q || '').trim()
    if (q) return q
    return ''
})

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

const onSelectCategory = async (item: any) => {
    await navigateTo({ path: '/article', query: { category: item.name } })
}

watch(() => route.query.q, (val) => { keyword.value = String(val || '') })

useHead({
    title: t('pages.article.title'),
    meta: [
        { name: 'description', content: t('pages.article.meta.description') }
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
:deep(.navBar) { 
    .card-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .breadcrumb {
        font-size: 14px;
        font-weight: bold;
        line-height: normal;
        a { text-decoration: none; color: var(--text-color); &:hover { color: var(--primary-hover-color); } }
    }
    .searchArea {
        display: flex;
        align-items: center;
        gap: @base-gap;
    }
}
.searchArea { display: flex; align-items: center; gap: 8px; }
</style>
