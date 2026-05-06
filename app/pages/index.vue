<template>
  <div class="home-page min-h-screen pt-header">
    <div class="container py-page">
      <h1 class="sr-only">PlankBevelen (Plank / Bevelen)</h1>

      <LayoutTwoColumn :loading="pending">
        <template #left>
          <WidgetBlogger
            :articleCount="homeData.stats?.articles"
            :categoryCount="homeData.stats?.categories"
            :tagCount="homeData.stats?.tags"
          />
        </template>

        <template #right>
          <WidgetHero />
          <WidgetAgent />

          <div class="home-cards">
            <WidgetLatest :articles="homeData.latestArticles" />

            <BaseCard class="home-card">
              <template #header>{{ $t('home.featuredProjects.title') }}</template>
              <ul class="simple-list">
                <li
                  v-for="project in featuredProjects"
                  :key="project.id"
                  class="simple-list-item project-item"
                >
                  <NuxtLink :to="localePath('/project')">
                    <span class="title">{{ project.title }}</span>
                    <span class="meta">{{ project.period || project.status }}</span>
                  </NuxtLink>
                </li>
                <li v-if="!featuredProjects.length" class="simple-list-empty">
                  {{ $t('home.featuredProjects.empty') }}
                </li>
              </ul>
            </BaseCard>
          </div>
        </template>
      </LayoutTwoColumn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { useAsyncData } from 'nuxt/app'
import http from '~/utils/http'
import type { SiteProject } from '@/types/site'
import type { Article } from '@/types/article'
import { SITE_URL, SITE_AUTHOR, usePageSeo } from '@/composables/useSeo'

const localePath = useLocalePath()
const { t } = useI18n()

type HomeStats = {
  articles: number
  categories: number
  tags: number
}

type HomeDataPayload = {
  latestArticles: Article[]
  featuredProjects: SiteProject[]
  categories: any[]
  tags: any[]
  stats: HomeStats | null
}

const homeData = reactive<HomeDataPayload>({
  latestArticles: [],
  featuredProjects: [],
  categories: [],
  tags: [],
  stats: null
})

const { data: homeResp, pending } = await useAsyncData<HomeDataPayload>('home-data', async () => {
  const res: any = await http.get('/home.data')
  if (res?.status === 200 && res?.data) return res.data
  return {
    latestArticles: [],
    featuredProjects: [],
    categories: [],
    tags: [],
    stats: null
  }
})

const featuredProjects = computed<SiteProject[]>(() => {
  return [...(homeData.featuredProjects || [])]
    .sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0))
    .slice(0, 4)
})

watch(
  homeResp,
  (newData) => {
    if (!newData) return
    homeData.latestArticles = newData.latestArticles || []
    homeData.featuredProjects = newData.featuredProjects || []
    homeData.categories = newData.categories || []
    homeData.tags = newData.tags || []
    homeData.stats = newData.stats || null
  },
  { immediate: true, deep: true }
)

const siteLdJson = computed(() =>
  JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: t('site.name'),
    url: SITE_URL,
    publisher: {
      '@type': 'Person',
      name: SITE_AUTHOR,
      alternateName: ['Plank', 'Bevelen'],
      url: SITE_URL
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/article?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  })
)

usePageSeo({
  title: t('pages.home.title'),
  description: t('pages.home.meta.description'),
  keywords: t('pages.home.meta.keywords')
})

useHead({
  titleTemplate: '',
  script: [
    {
      key: 'home-ld',
      type: 'application/ld+json',
      children: siteLdJson.value
    }
  ]
})
</script>

<style lang="less" scoped>
.home-page {
  padding-top: @header-height;
}

.container {
  padding-top: 40px;
  padding-bottom: 40px;
}

.home-cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.simple-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.simple-list-item {
  a {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 10px;
    border-radius: @base-border-radius;
    text-decoration: none;
    border: 1px solid transparent;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--border-color);
      background: var(--shallow-hover-bg-color);
    }
  }

  .title {
    color: var(--text-color);
    font-size: @font-size-sm;
    line-height: 1.6;
  }

  .meta {
    color: var(--tertiary-color);
    font-size: @font-size-xs;
    white-space: nowrap;
  }
}

.project-item .title {
  font-weight: 600;
}

.simple-list-empty {
  font-size: @font-size-sm;
  color: var(--tertiary-color);
}

@media (max-width: 1024px) {
  .home-cards {
    grid-template-columns: 1fr;
  }
}
</style>
