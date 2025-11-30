<template>
    <div class="article-detail">
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
                            <NuxtLink to="/article">文章</NuxtLink>
                            <span> / </span>
                            <span>{{ article?.title || '详情' }}</span>
                        </div>
                    </Card>
                    <Card class="detailCard">
                        <div class="title">{{ article?.title }}</div>
                        <div class="meta">
                            <span class="category">{{ displayCategory }}</span>
                            <span class="dot">·</span>
                            <span class="time">{{ formatDateTime(article?.updateTime || article?.createTime || '') }}</span>
                        </div>
                        <div class="content">
                            <MdPreview v-if="article" :modelValue="article.content" :theme="currentTheme" />
                        </div>
                    </Card>
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
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAsyncData, useHead } from 'nuxt/app'
import http from '~/utils/http-common'
import Card from '@/components/cards/card.vue'
import ThreeColumnLayout from '@/components/layouts/ThreeColumnLayout.vue'
import BloggerCard from '@/components/cards/blogger.vue'
import RecordLinkCard from '@/components/cards/recordLink.vue'
import CategoryCard from '@/components/cards/category.vue'
import TagCard from '@/components/cards/tag.vue'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { formatDateTime } from '@/utils/format'
import { useAdminStore } from '@/stores/admin.store'

const admin = useAdminStore()
const currentTheme = computed(() => admin.getTheme)

const route = useRoute()
const id = computed(() => String(route.params.id || ''))

const { data: detailData, pending } = await useAsyncData('article-detail', async () => {
  const res = await http.get(`/api/article/${id.value}`)
  if (res.status === 200 && res.data.status === 200) return res.data.data
  return null
})

const article = computed(() => detailData.value || null)

const { data: homeData } = await useAsyncData('article-detail-home-data', async () => {
  const res = await http.get('/api/home.data')
  if (res.status === 200 && res.data.status === 200) return res.data.data
  return null
})

const categories = computed(() => homeData.value?.categories || [])
const tags = computed(() => homeData.value?.tags || [])
const stats = computed(() => homeData.value?.stats || null)

const displayCategory = computed(() => {
  const cid = String(article.value?.category || '')
  const c = (categories.value || []).find((x: any) => String(x.id) === cid)
  return c ? c.name : ''
})

useHead({
  title: article.value?.title ? `${article.value.title} - 文章详情` : '文章详情',
  meta: [
    { name: 'description', content: (article.value?.content || '').slice(0, 120) }
  ]
})

</script>

<style scoped lang="less">
.article-detail {
  min-height: 100vh;
  padding-top: @header-height;
  .container { padding: 40px 0; }
}
.detailCard {
  line-height: normal;
  display: flex;
  flex-direction: column;
  gap: 12px;
  .title {
    font-size: 28px;
    font-weight: 500;
    color: var(--primary-color);
  }
  .meta { color: var(--tertiary-color); font-size: 12px; .dot { margin: 0 6px; } }
  :deep(.md-editor-preview) { font-size: 14px !important; }
}
</style>

