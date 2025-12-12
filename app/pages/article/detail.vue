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
                    <span class="time">{{ timeText }}</span>
                    <div class="tags" v-if="(article?.tags || []).length">
                        <nuxt-icon name="article/tag" />
                        <span v-for="tag in (article?.tags || [])" :key="tag">{{ tag }}</span>
                    </div>
                </div>
                <MdPreview :modelValue="displayContent" :theme="currentTheme" :noMermaid="true" :noKatex="true" />
                <div class="prev-next">
                  <div class="item prev" v-if="article?.prev" >
                    <NuxtLink :to="{ path: '/article/detail', query: { id: article.prev.id } }" class="link">{{ $t('pages.article.articleDetail.prev') }}：{{ article.prev.title }}</NuxtLink>
                  </div>
                  <div class="item next" v-if="article?.next">
                    <NuxtLink :to="{ path: '/article/detail', query: { id: article.next.id } }" class="link">{{ $t('pages.article.articleDetail.next') }}：{{ article.next.title }}</NuxtLink>
                  </div>
                </div>
              </Card>
            </template>
          </TwoColumnLayout>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAsyncData, useHead, navigateTo, createError } from 'nuxt/app'
import http from '~/utils/http'
import Card from '@/components/cards/card.vue'
import TwoColumnLayout from '@/components/layouts/TwoColumnLayout.vue'
import BloggerCard from '@/components/cards/blogger.vue'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { formatDateTime } from '@/utils/format'
import { useAdminStore } from '@/stores/admin.store'
import Toc from '@/components/article/toc.vue'
import { t } from '@/components/i18n/index'
import articleService from '@/services/article.service'

const admin = useAdminStore()
const currentTheme = computed(() => admin.getTheme)

const route = useRoute()
const id = computed(() => {
  return String(route.query.id || route.params.id || '')
})
if (!id.value) {
  await navigateTo('/article', { replace: true })
}

const { data: detailData, pending } = await useAsyncData(
  'article-detail',
  async () => {
    const rid = id.value
    if (!rid) {
      throw createError({ statusCode: 400, statusMessage: '参数错误' })
    }
    if (process.server) {
      const r: any = await $fetch(`/api/article/${rid}`)
      if (r?.status === 200) return r.data
      return null
    } else {
      const res = await articleService.getArticle(rid)
      if (res.status === 200 && res.data.status === 200) {
        return res.data.data
      }
      return null
    }
  },
  {
    watch: [id]
  }
)

const article = computed(() => detailData.value || null)
const timeText = computed(() => formatDateTime(article.value?.updateTime || article.value?.createTime || ''))
const displayContent = computed(() =>  String(article.value?.content || '') )

const { data: homeData } = await useAsyncData('article-detail-home-data', async () => {
  if (process.server) {
    const r: any = await $fetch('/api/home.data')
    if (r?.status === 200) return r.data
    return null
  } else {
    const res = await http.get('/api/home.data')
    if (res.status === 200 && res.data.status === 200) return res.data.data
    return null
  }
})

const stats = computed(() => homeData.value?.stats || null)
const categories = computed(() => homeData.value?.categories || [])
const articleCategory = computed(() => {
  const cid = String(article.value?.category || '')
  const c = (categories.value || []).find((x: any) => String(x.id) === cid)
  return c ? c.name : ''
})

useHead({
  title: article.value?.title ? `${article.value.title}${t('pages.article.articleDetail.suffix')}` : t('pages.article.articleDetail.fallback'),
  meta: [
    { name: 'description', content: (article.value?.content || '').slice(0, 120) || t('pages.article.articleDetail.meta.description') }
  ]
})

</script>

<style lang="less" scoped>
.article-detail {
    min-height: 100vh;
    padding-top: @header-height;
    .container {
        padding: 40px 0;
    }
}
.detailCard {
  :deep(.card-content) {
    padding: 40px 40px 20px 40px;
  }
}
.title {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-color);
    margin-bottom: 20px;
    text-align: center;
}
.meta {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: var(--secondary-color);
    font-size: 14px;
    margin-bottom: 40px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border-color);
    .category {
        color: var(--primary-color);
    }
    .dot {
        font-weight: bold;
    }
    .tags {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-left: 12px;
        :deep(.nuxt-icon) {
            font-size: 16px;
        }
    }
}
.prev-next {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
  display: flex;
  width: 100%;
  justify-content: space-between;
  
  .item {
    font-size: 14px;
    color: var(--secondary-color);
    
    .link {
      color: var(--text-color);
      text-decoration: none;
      transition: color 0.3s;
      
      &:hover {
        color: var(--primary-color);
      }
    }
  }
}
</style>
