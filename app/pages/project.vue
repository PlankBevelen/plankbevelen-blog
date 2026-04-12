<template>
  <div class="project-page">
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
          <div v-if="projects.length" class="project-list">
            <BaseCard v-for="project in projects" :key="project.id" class="project-card">
              <div class="project-card__head">
                <div class="project-accent" :style="{ background: project.accentColor }"></div>
                <div class="project-headline">
                  <div class="project-title-row">
                    <h2>{{ project.title }}</h2>
                    <el-tag effect="plain" round>{{ project.status }}</el-tag>
                  </div>
                  <p>{{ project.summary }}</p>
                </div>
              </div>

              <div class="project-meta">
                <span>{{ project.period || '时间待补充' }}</span>
                <span>{{ project.tags.length }} 个标签</span>
              </div>

              <p class="project-description">{{ project.description }}</p>

              <div v-if="project.tags.length" class="project-tags">
                <el-tag
                  v-for="tag in project.tags"
                  :key="`${project.id}-${tag}`"
                  effect="light"
                  round
                >
                  {{ tag }}
                </el-tag>
              </div>

              <div v-if="project.highlights.length" class="project-highlights">
                <div v-for="highlight in project.highlights" :key="highlight" class="highlight-item">
                  {{ highlight }}
                </div>
              </div>

              <div v-if="project.links.repoUrl || project.links.demoUrl" class="project-links">
                <a v-if="project.links.repoUrl" :href="project.links.repoUrl" target="_blank">
                  查看仓库
                </a>
                <a v-if="project.links.demoUrl" :href="project.links.demoUrl" target="_blank">
                  在线预览
                </a>
              </div>
            </BaseCard>
          </div>

          <BaseCard v-else>
            <el-empty description="暂时还没有项目介绍内容" />
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
import { computed } from 'vue'
import { useAsyncData } from 'nuxt/app'
import siteService from '@/services/site.service'
import { useSidebarData } from '@/composables/useSidebarData'

const { data, pending } = await useSidebarData()
const stats = computed(() => data.value?.stats || null)

const { data: contentData, pending: contentPending } = await useAsyncData('site-project-content', async () => {
  const res: any = await siteService.getContent()
  return res?.data || { about: { zh: '', en: '' }, projects: [] }
})

const projects = computed(() =>
  [...(contentData.value?.projects || [])].sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0))
)

const uniqueTags = computed(() => {
  const tagSet = new Set<string>()
  for (const project of projects.value) {
    for (const tag of project.tags || []) {
      tagSet.add(tag)
    }
  }
  return Array.from(tagSet)
})

usePageSeo({
  title: '项目介绍',
  description: '查看个人项目、实验作品与持续迭代中的站点建设内容。'
})
</script>

<style lang="less" scoped>
.project-page {
  min-height: 100vh;
  padding-top: @header-height;

  .container {
    padding-top: 40px;
    padding-bottom: 40px;
  }
}

.project-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.project-card {
  overflow: hidden;
}

.project-card__head {
  display: flex;
  gap: 18px;
  align-items: flex-start;
}

.project-accent {
  width: 12px;
  min-width: 12px;
  height: 96px;
  border-radius: 999px;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
}

.project-headline {
  flex: 1;

  h2 {
    margin: 0;
    font-size: 24px;
    color: var(--text-color);
  }

  p {
    margin: 10px 0 0;
    font-size: 15px;
    line-height: 1.8;
    color: var(--secondary-color);
  }
}

.project-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.project-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin: 18px 0 0;
  font-size: 13px;
  color: var(--tertiary-color);
}

.project-description {
  margin: 16px 0 0;
  font-size: 14px;
  line-height: 1.9;
  color: var(--text-color);
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}

.project-highlights {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.highlight-item {
  padding: 14px 16px;
  border-radius: 18px;
  background: color-mix(in srgb, var(--card-color) 70%, #f7f8fb);
  border: 1px solid var(--border-color);
  color: var(--secondary-color);
  line-height: 1.7;
}

.project-links {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 18px;

  a {
    font-size: 14px;
    color: var(--primary-color);
    text-decoration: none;

    &:hover {
      color: var(--primary-hover-color);
    }
  }
}

@media (max-width: 960px) {
  .project-hero-stats,
  .project-highlights {
    grid-template-columns: 1fr;
  }

  .project-title-row,
  .project-card__head {
    flex-direction: column;
    align-items: flex-start;
  }

  .project-accent {
    width: 96px;
    height: 12px;
  }
}
</style>
