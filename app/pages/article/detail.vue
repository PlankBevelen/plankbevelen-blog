<template>
    <div class="article-detail">
        <div class="container">
          <TwoColumnLayout :loading="pending" type="rightbigger">
            <template #left>
              <BloggerCard :articleCount="stats?.articles || 0" :categoryCount="stats?.categories || 0" :tagCount="stats?.tags || 0" />
              <Toc :content="article?.content || ''" />
            </template>
            <template #right>
              <Card class="detailCard">
                <div class="title">{{ article?.title }}</div>
                <div class="meta">
                    <span class="category">{{ articleCategory }}</span>
                    <span class="dot">·</span>
                    <span class="time">{{ formatDateTime(article?.updateTime || article?.createTime || '') }}</span>
                </div>
                <MdPreview v-if="article" :modelValue="article.content" :theme="currentTheme" />
              </Card>
            </template>
          </TwoColumnLayout>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAsyncData, useHead } from 'nuxt/app'
import http from '~/utils/http-common'
import Card from '@/components/cards/card.vue'
import TwoColumnLayout from '@/components/layouts/TwoColumnLayout.vue'
import BloggerCard from '@/components/cards/blogger.vue'
import RecordLinkCard from '@/components/cards/recordLink.vue'
import CategoryCard from '@/components/cards/category.vue'
import TagCard from '@/components/cards/tag.vue'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { formatDateTime } from '@/utils/format'
import { useAdminStore } from '@/stores/admin.store'
import Toc from '@/components/article/toc.vue'

const admin = useAdminStore()
const currentTheme = computed(() => admin.getTheme)

const route = useRoute()
const id = computed(() => String(route.query.id || ''))

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

const stats = computed(() => homeData.value?.stats || null)
const categories = computed(() => homeData.value?.categories || [])
const articleCategory = computed(() => {
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
    cursor: pointer;
    margin-bottom: 12px;
    text-decoration: none;
    line-height: normal;
    display: block;
  }
  .meta { color: var(--tertiary-color); font-size: 12px; .dot { margin: 0 6px; } }
  :deep(.md-editor-preview) { font-size: 14px !important; }
}
</style>
