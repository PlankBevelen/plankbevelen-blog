<template>
  <div class="article">
    <div class="container">
      <LayoutThreeColumn :loading="homePending">
        <template #left>
          <WidgetBlogger :articleCount="stats?.articles || 0" :categoryCount="stats?.categories || 0" :tagCount="stats?.tags || 0" />
          <WidgetRecordLink />
        </template>
        <template #middle>
          <BaseCard class="navBar">
            <div class="breadcrumb">
              <NuxtLink :to="localePath('/article')">{{ $t('pages.article.title') }}</NuxtLink>
              <template v-if="breadcrumbSuffix">
                <span> / </span>
                <span>{{ breadcrumbSuffix }}</span>
              </template>
            </div>
            <div class="searchArea">
              <el-input v-model="keyword" :placeholder="$t('pages.article.search.placeholder')" clearable />
              <el-button type="primary" @click="onSearch">{{ $t('pages.article.search.btn') }}</el-button>
            </div>
          </BaseCard>
          <ArticleList :q="currentQuery" />                    
        </template>
        <template #right>
          <WidgetCategory :categories="homeData?.categories" @select="onSelectCategory"/>
          <WidgetTag :tags="homeData?.tags" />
        </template>
      </LayoutThreeColumn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { navigateTo, useAsyncData } from 'nuxt/app'







import http from '~/utils/http'
import { usePageSeo } from '@/composables/useSeo'

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const keyword = ref(String(route.query.q || ''))

const currentQuery = computed(() => {
    const cat = String(route.query.category || '')
    if (cat) return cat
    return String(route.query.q || '')
})

const breadcrumbSuffix = computed(() => {
    const cat = String(route.query.category || '')
    if (cat) return cat
    const q = String(route.query.q || '').trim()
    if (q) return q
    return ''
})

const { data: homeData, pending: homePending } = await useAsyncData('article-page-home-data', async () => {
    const res = await http.get('/api/home.data') as any
    if (res.status === 200) return res.data
    return null
})

const stats = computed(() => homeData.value?.stats || null)

const onSearch = async () => {
    await navigateTo({ path: localePath('/article'), query: { q: keyword.value || undefined } })
}

const onSelectCategory = async (item: any) => {
    await navigateTo({ path: localePath('/article'), query: { category: item.name } })
}

watch(() => route.query.q, (val) => { keyword.value = String(val || '') })

// SEO：canonical 由 app.vue 统一处理
usePageSeo({
  title: t('pages.article.title'),
  description: t('pages.article.meta.description'),
})
</script>

<style lang="less" scoped>
.article {
  min-height: 100vh;
  padding-top: @header-height;
  .container { padding: 40px 0; }
}
:deep(.navBar) {
  .card-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
  }
  .breadcrumb {
      font-size: @font-size-md;
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
</style>