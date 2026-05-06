<template>
  <div class="about">
    <div class="container">
      <LayoutThreeColumn :loading="pending || contentPending">
        <template #left>
          <WidgetBlogger
            :articleCount="stats?.articles || 0"
            :categoryCount="stats?.categories || 0"
            :tagCount="stats?.tags || 0"
          />
          <WidgetRecordLink />
        </template>

        <template #middle>
          <BaseCard class="about-content">
            <h1 class="title">{{ $t('pages.about.title') }}</h1>
            <Suspense v-if="aboutMd">
              <template #default>
                <AsyncMdPreview :modelValue="aboutMd" :theme="currentTheme" />
              </template>
              <template #fallback>
                <el-skeleton rows="6" animated />
              </template>
            </Suspense>
            <el-empty v-else description="暂无关于内容" />
          </BaseCard>

          <BaseCard class="contact-card">
            <template #header>联系我</template>
            <ul class="contact-list">
              <li>
                <span class="label">邮箱</span>
                <a href="mailto:plankbevelen@gmail.com">plankbevelen@gmail.com</a>
              </li>
              <li>
                <span class="label">微信</span>
                <span class="value">PlankBevelen</span>
              </li>
              <li>
                <span class="label">GitHub</span>
                <a href="https://github.com/" target="_blank" rel="noopener noreferrer">
                  github.com
                </a>
              </li>
            </ul>
          </BaseCard>

          <BaseCard class="timeline-card">
            <template #header>成长时间线</template>
            <div class="timeline">
              <div v-for="item in growthTimeline" :key="item.year + item.title" class="timeline-item">
                <div class="dot"></div>
                <div class="timeline-content">
                  <p class="year">{{ item.year }}</p>
                  <h3>{{ item.title }}</h3>
                  <p>{{ item.desc }}</p>
                </div>
              </div>
            </div>
          </BaseCard>
        </template>

        <template #right>
          <WidgetCategory :categories="data?.categories" />
          <WidgetTag :tags="data?.tags" />
        </template>
      </LayoutThreeColumn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useAsyncData } from 'nuxt/app'
import { useSidebarData } from '@/composables/useSidebarData'
import siteService from '@/services/site.service'
import { useAdminStore } from '@/stores/admin.store'

const { t, locale } = useI18n()

const { data, pending } = await useSidebarData()
const stats = computed(() => data.value?.stats || null)
const admin = useAdminStore()
const currentTheme = computed(() => admin.getTheme)

const { data: contentData, pending: contentPending } = await useAsyncData('site-content-public', async () => {
  const res: any = await siteService.getContent()
  return (
    res?.data || {
      about: { zh: '', en: '' },
      projects: []
    }
  )
})

const growthTimeline = computed(() => [
  {
    year: '2022',
    title: '前端起步',
    desc: '系统学习 Vue 与工程化，开始独立做页面和交互。'
  },
  {
    year: '2023',
    title: '全栈探索',
    desc: '逐步接触 Node.js 服务开发，打通前后端协作流程。'
  },
  {
    year: '2024',
    title: '产品化实践',
    desc: '将博客与项目展示统一管理，沉淀内容和工程模板。'
  },
  {
    year: '2025 - 至今',
    title: 'AI + 工具链',
    desc: '围绕 plank-agent 与内容系统持续迭代，提升效率与可复用性。'
  }
])

const aboutMd = computed(() => {
  const about = contentData.value?.about
  if (!about) return ''
  return locale.value === 'en' ? about.en || about.zh || '' : about.zh || about.en || ''
})

const AsyncMdPreview = defineAsyncComponent(() => {
  const key = '__md_preview_loader'
  if (!(globalThis as any)[key]) {
    ;(globalThis as any)[key] = (async () => {
      const mod = await import('md-editor-v3')
      await import('md-editor-v3/lib/style.css')
      return mod.MdPreview || mod.default?.MdPreview || mod
    })()
  }
  return (globalThis as any)[key]
})

usePageSeo({
  title: t('pages.about.title'),
  description: t('pages.about.meta.description')
})
</script>

<style lang="less" scoped>
.about {
  min-height: 100vh;
  padding-top: @header-height;

  .container {
    padding-top: 40px;
    padding-bottom: 40px;
  }
}

.about-content {
  overflow: hidden;
}

.title {
  margin: 0;
  font-size: @font-size-xxl;
  font-weight: 600;
  color: var(--text-color);
  line-height: 1.2;
}

.contact-list {
  display: flex;
  flex-direction: column;
  gap: 12px;

  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 12px;
    border-radius: @base-border-radius;
    background: color-mix(in srgb, var(--card-color) 85%, #f7f9fc);
    border: 1px solid var(--border-color);
  }

  .label {
    font-size: @font-size-sm;
    color: var(--tertiary-color);
  }

  .value,
  a {
    font-size: @font-size-sm;
    color: var(--text-color);
    text-decoration: none;
  }

  a:hover {
    color: var(--primary-color);
  }
}

.timeline {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.timeline-item {
  display: grid;
  grid-template-columns: 18px 1fr;
  gap: 12px;
}

.dot {
  width: 10px;
  height: 10px;
  margin-top: 6px;
  border-radius: 50%;
  background: var(--primary-color);
  box-shadow: 0 0 0 6px var(--shallow-active-bg-color);
}

.timeline-content {
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background: color-mix(in srgb, var(--card-color) 82%, #f6fbff);

  .year {
    margin: 0;
    font-size: @font-size-xs;
    color: var(--primary-color);
  }

  h3 {
    margin: 6px 0 0;
    font-size: @font-size-md;
    color: var(--text-color);
  }

  p {
    margin: 8px 0 0;
    font-size: @font-size-sm;
    line-height: 1.8;
    color: var(--secondary-color);
  }
}
</style>
