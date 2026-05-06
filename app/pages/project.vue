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
              <div class="project-top">
                <div class="project-title-wrap">
                  <h2>{{ project.title }}</h2>
                  <el-tag effect="plain" round>{{ project.status || '持续迭代' }}</el-tag>
                </div>
                <div class="project-stats">
                  <span>{{ project.period || '长期维护' }}</span>
                  <span>{{ project.tags.length }} 项技术栈</span>
                  <span>{{ project.highlights.length }} 个能力点</span>
                </div>
              </div>

              <p class="project-summary">{{ project.summary }}</p>
              <p class="project-description">{{ project.description }}</p>

              <div v-if="project.highlights.length" class="project-highlights">
                <div v-for="highlight in project.highlights" :key="highlight" class="highlight-item">
                  {{ highlight }}
                </div>
              </div>

              <div v-if="project.tags.length" class="project-tags">
                <el-tag v-for="tag in project.tags" :key="`${project.id}-${tag}`" effect="light" round>
                  {{ tag }}
                </el-tag>
              </div>

              <div v-if="project.links.repoUrl || project.links.demoUrl" class="project-links">
                <a v-if="project.links.repoUrl" :href="project.links.repoUrl" target="_blank" rel="noopener noreferrer">
                  仓库地址
                </a>
                <a v-if="project.links.demoUrl" :href="project.links.demoUrl" target="_blank" rel="noopener noreferrer">
                  在线预览
                </a>
              </div>
            </BaseCard>
          </div>

          <BaseCard v-else>
            <el-empty description="暂时还没有项目内容" />
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

usePageSeo({
  title: '项目',
  description: '这里展示我在持续维护与迭代的重点项目，包括目标、技术栈与核心能力。'
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
  border-radius: 12px;
}

.project-top {
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border-color);
}

.project-title-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  h2 {
    margin: 0;
    font-size: 32px;
    letter-spacing: 0.01em;
    color: var(--text-color);
  }
}

.project-stats {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  span {
    font-size: @font-size-xs;
    color: var(--tertiary-color);
    border: 1px solid var(--border-color);
    border-radius: 999px;
    padding: 5px 10px;
    background: color-mix(in srgb, var(--card-color) 74%, #f5f8fd);
  }
}

.project-summary {
  margin: 16px 0 0;
  font-size: 18px;
  color: var(--secondary-color);
  line-height: 1.8;
}

.project-description {
  margin: 12px 0 0;
  font-size: @font-size-sm;
  line-height: 1.9;
  color: var(--text-color);
}

.project-highlights {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 16px;
}

.highlight-item {
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: color-mix(in srgb, var(--card-color) 72%, #f6f9ff);
  line-height: 1.75;
  font-size: @font-size-sm;
  color: var(--secondary-color);
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}

.project-links {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 16px;

  a {
    text-decoration: none;
    font-size: @font-size-sm;
    color: var(--primary-color);

    &:hover {
      color: var(--primary-hover-color);
    }
  }
}

@media (max-width: 960px) {
  .project-title-wrap {
    flex-direction: column;
    align-items: flex-start;

    h2 {
      font-size: 28px;
    }
  }

  .project-highlights {
    grid-template-columns: 1fr;
  }
}
</style>
