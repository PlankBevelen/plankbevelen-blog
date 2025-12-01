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
              </Card>
              <!-- <Card v-else class="detailCard">
                <div class="title">{{ t('pages.article.articleDetail.fallback') }}</div>
              </Card> -->
            </template>
          </TwoColumnLayout>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAsyncData, useHead, navigateTo, createError } from 'nuxt/app'
import http from '~/utils/http-common'
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
  `article-detail-${id.value}`,
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
  }
)

const article = computed(() => detailData.value || null)
const timeText = computed(() => formatDateTime(article.value?.updateTime || article.value?.createTime || ''))
const displayContent = computed(() => {
  const src = String(article.value?.content || '')
  return src.replace(/</g, '&lt;').replace(/>/g, '&gt;')
})

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
  max-height: auto; 
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
  .meta {
        color: var(--tertiary-color);
        font-size: 12px;
        display: flex;
        gap: 8px;
        text-wrap: auto;
        .tags {
            display: flex;
            gap: 4px;
            font-size: 12px;
        }
    }
  :deep(.md-editor-preview) { font-size: 14px !important; max-height: auto; }
}
</style>
