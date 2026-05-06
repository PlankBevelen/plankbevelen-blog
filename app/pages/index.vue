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
          <BaseCard class="hero-card">
            <div class="hero-grid-bg"></div>
            <div class="hero-content">
              <p class="hero-kicker">你好，欢迎来到我的站点</p>
              <h2 class="hero-title">
                构建有趣且
                <br />
                实用的东西
              </h2>
              <p class="hero-desc">
                一个热爱技术的开发者，专注于有趣且实用的产品。在这里分享我的项目、想法和学习笔记。
              </p>
              <p class="hero-stack">Vue · Nuxt · Node.js · GSAP · Three.js</p>
              <div class="hero-actions">
                <NuxtLink class="hero-btn hero-btn--primary" :to="localePath('/article')">
                  浏览文章
                </NuxtLink>
                <NuxtLink class="hero-btn hero-btn--ghost" :to="localePath('/project')">
                  查看项目
                </NuxtLink>
              </div>
            </div>
          </BaseCard>

          <WidgetAgent />

          <div class="home-cards">
            <BaseCard class="home-card">
              <template #header>最新文章</template>
              <ul class="simple-list">
                <li v-for="item in latestArticles" :key="item.id" class="simple-list-item">
                  <NuxtLink :to="localePath(`/article/${item.id}`)">
                    <span class="title">{{ item.title }}</span>
                    <span class="meta">{{ formatDate(item.updateTime || item.createTime) }}</span>
                  </NuxtLink>
                </li>
                <li v-if="!latestArticles.length" class="simple-list-empty">暂无文章</li>
              </ul>
            </BaseCard>

            <BaseCard class="home-card">
              <template #header>精选项目</template>
              <ul class="simple-list">
                <li
                  v-for="project in featuredProjects"
                  :key="project.id"
                  class="simple-list-item project-item"
                >
                  <NuxtLink :to="localePath('/project')">
                    <span class="title">{{ project.title }}</span>
                    <span class="meta">{{ project.status || project.period }}</span>
                  </NuxtLink>
                </li>
                <li v-if="!featuredProjects.length" class="simple-list-empty">暂无项目</li>
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
import siteService from '@/services/site.service'
import type { SiteProject } from '@/types/site'
import type { Article } from '@/types/article'
import { formatDate } from '@/utils/format'
import { SITE_URL, SITE_AUTHOR, usePageSeo } from '@/composables/useSeo'
import { useSidebarData } from '@/composables/useSidebarData'

const localePath = useLocalePath()
const { t } = useI18n()

const homeData = reactive<{
  articles: Article[]
  latestArticles: Article[]
  categories: any[]
  tags: any[]
  stats: any
}>({
  articles: [],
  latestArticles: [],
  categories: [],
  tags: [],
  stats: null
})

const { data: sidebarData } = await useSidebarData()

const { data, pending } = await useAsyncData('home-data', async () => {
  const res: any = await http.get('/home.data')
  if (res?.status === 200) return res.data
  return { articles: [] }
})

const { data: siteContent } = await useAsyncData('home-site-content', async () => {
  const res: any = await siteService.getContent()
  if (res?.status === 200) return res.data
  return { about: { zh: '', en: '' }, projects: [] }
})

const latestArticles = computed<Article[]>(() => {
  const source = homeData.latestArticles.length ? homeData.latestArticles : homeData.articles
  return [...source]
    .sort((a, b) => new Date(b.updateTime || b.createTime).getTime() - new Date(a.updateTime || a.createTime).getTime())
    .slice(0, 5)
})

const featuredProjects = computed<SiteProject[]>(() => {
  return [...(siteContent.value?.projects || [])]
    .sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0))
    .slice(0, 4)
})

watch(
  sidebarData,
  (newData) => {
    if (!newData) return
    homeData.latestArticles = newData.latestArticles || []
    homeData.categories = newData.categories || []
    homeData.tags = newData.tags || []
    homeData.stats = newData.stats || null
  },
  { immediate: true, deep: true }
)

watch(
  data,
  (newData) => {
    if (newData) homeData.articles = newData.articles || []
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
      url: SITE_URL,
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
  keywords: t('pages.home.meta.keywords'),
})

useHead({
  titleTemplate: '',
  script: [
    {
      key: 'home-ld',
      type: 'application/ld+json',
      children: siteLdJson.value,
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

.hero-card {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 80% 0%, color-mix(in srgb, var(--primary-color) 24%, transparent), transparent 38%),
    linear-gradient(180deg, color-mix(in srgb, var(--card-color) 92%, #f8fbff), var(--card-color));
  border: 1px solid color-mix(in srgb, var(--primary-color) 32%, var(--border-color));
}

.hero-grid-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(to right, color-mix(in srgb, var(--primary-color) 12%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in srgb, var(--primary-color) 12%, transparent) 1px, transparent 1px);
  background-size: 36px 36px;
  opacity: 0.55;
}

.hero-content {
  position: relative;
  z-index: 2;
  padding: 12px 6px;
}

.hero-kicker {
  margin: 0;
  font-size: 14px;
  color: var(--primary-color);
}

.hero-title {
  margin: 14px 0 0;
  line-height: 1.08;
  font-size: clamp(40px, 6vw, 84px);
  color: var(--text-color);
  letter-spacing: 0.02em;
}

.hero-desc {
  margin-top: 18px;
  font-size: 16px;
  line-height: 1.8;
  color: var(--secondary-color);
}

.hero-stack {
  margin-top: 12px;
  font-size: 18px;
  color: color-mix(in srgb, var(--text-color) 80%, #8197af);
}

.hero-actions {
  margin-top: 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.hero-btn {
  height: 42px;
  min-width: 130px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  border-radius: 12px;
  text-decoration: none;
  font-size: 15px;
  transition: all 0.2s ease;
}

.hero-btn--primary {
  color: #fff;
  background: var(--primary-color);

  &:hover {
    background: var(--primary-hover-color);
  }
}

.hero-btn--ghost {
  color: var(--text-color);
  border: 1px solid var(--border-color);
  background: color-mix(in srgb, var(--card-color) 70%, #f4f8ff);

  &:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }
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

  .hero-title {
    font-size: clamp(34px, 12vw, 64px);
  }
}
</style>
