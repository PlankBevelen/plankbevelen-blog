<template>
  <div class="notes-page">
    <div class="container">
      <LayoutTwoColumn :loading="pending || contentPending">
        <template #left>
          <WidgetBlogger
            :articleCount="stats?.articles || 0"
            :categoryCount="stats?.categories || 0"
            :tagCount="stats?.tags || 0"
          />
          <WidgetRecordLink />
        </template>

        <template #right>
          <div class="notes-grid">
            <BaseCard
              v-for="category in noteCategories"
              :key="category.id"
              class="note-category-card"
              @click="onSelectCategory(category)"
            >
              <div class="category-accent" :style="{ background: category.gradient }"></div>
              <div class="category-body">
                <div class="category-icon" :style="{ color: category.accent }">
                  <el-icon :size="28">
                    <component :is="category.icon" />
                  </el-icon>
                </div>
                <div class="category-info">
                  <h3 class="category-name">{{ category.label }}</h3>
                  <p class="category-desc">{{ category.desc }}</p>
                  <span class="category-count">{{ category.count }} 篇笔记</span>
                </div>
              </div>
            </BaseCard>
          </div>

          <BaseCard v-if="!noteCategories.length">
            <el-empty description="暂无笔记分类" />
          </BaseCard>
        </template>
      </LayoutTwoColumn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Connection,
  Document,
  Monitor,
  Orange,
  Setting,
  Tools
} from '@element-plus/icons-vue'
import { useSidebarData } from '@/composables/useSidebarData'
import { useSiteContent } from '@/composables/useSiteContent'
import { resolveLocalizedText } from '@/utils/localized-text'

const { t, locale } = useI18n()
const localePath = useLocalePath()

const { data, pending } = await useSidebarData()
const stats = computed(() => data.value?.stats || null)
const { data: contentData, pending: contentPending } = await useSiteContent()

const pageTitle = computed(() =>
  locale.value === 'en' ? 'Notes' : '笔记'
)

const notesIntro = computed(() =>
  resolveLocalizedText(contentData.value?.pages?.notes, locale.value)
)

interface NoteCategory {
  id: string
  icon: any
  label: string
  desc: string
  count: number
  accent: string
  gradient: string
}

const noteCategories = computed<NoteCategory[]>(() => {
  const isEn = locale.value === 'en'
  return [
    {
      id: 'browser-network',
      icon: Connection,
      label: isEn ? 'Browser & Network' : '浏览器 & 网络',
      desc: isEn
        ? 'HTTP, TCP/IP, DNS, cache strategies, CDN and browser networking internals.'
        : 'HTTP、TCP/IP、DNS、缓存策略、CDN 与浏览器网络原理。',
      count: 0,
      accent: '#0ea5e9',
      gradient: 'linear-gradient(135deg, #0ea5e9, #06b6d4)'
    },
    {
      id: 'javascript',
      icon: Document,
      label: 'JavaScript',
      desc: isEn
        ? 'ES6+, async patterns, closures, prototype chain, event loop and runtime fundamentals.'
        : 'ES6+、异步模式、闭包、原型链、事件循环与运行时基础。',
      count: 0,
      accent: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)'
    },
    {
      id: 'html',
      icon: Monitor,
      label: 'HTML',
      desc: isEn
        ? 'Semantic tags, accessibility, SEO-friendly structure, forms and modern HTML APIs.'
        : '语义化标签、可访问性、SEO 友好结构、表单与现代 HTML API。',
      count: 0,
      accent: '#f97316',
      gradient: 'linear-gradient(135deg, #f97316, #fb923c)'
    },
    {
      id: 'css',
      icon: Orange,
      label: 'CSS',
      desc: isEn
        ? 'Layout modes, responsive design, animations, custom properties and modern CSS techniques.'
        : '布局模式、响应式设计、动画、自定义属性与现代 CSS 技巧。',
      count: 0,
      accent: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)'
    },
    {
      id: 'frontend-engineering',
      icon: Setting,
      label: isEn ? 'Frontend Engineering' : '前端工程化',
      desc: isEn
        ? 'Build tools, module systems, CI/CD, monorepo, testing strategies and devOps for frontend.'
        : '构建工具、模块化、CI/CD、Monorepo、测试策略与前端 DevOps。',
      count: 0,
      accent: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981, #34d399)'
    },
    {
      id: 'frontend-tools',
      icon: Tools,
      label: isEn ? 'Frontend Tools' : '前端工具',
      desc: isEn
        ? 'DevTools, VS Code plugins, debugging技巧, performance profiling and productivity workflows.'
        : 'DevTools、VS Code 插件、调试技巧、性能分析与效率工作流。',
      count: 0,
      accent: '#6366f1',
      gradient: 'linear-gradient(135deg, #6366f1, #818cf8)'
    }
  ]
})

const onSelectCategory = (category: NoteCategory) => {
  navigateTo({
    path: localePath('/article'),
    query: { category: category.label }
  })
}

usePageSeo({
  title: () => (locale.value === 'en' ? 'Notes' : '笔记'),
  description: () =>
    locale.value === 'en'
      ? 'Organized frontend notes covering browser networking, JavaScript, HTML, CSS, engineering practices and tooling.'
      : '前端笔记分类整理：浏览器网络、JavaScript、HTML、CSS、工程化与工具。'
})
</script>

<style lang="less" scoped>
.notes-page {
  min-height: 100vh;
  padding-top: @header-height;

  .container {
    padding-top: 40px;
    padding-bottom: 40px;
  }
}

.notes-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.note-category-card {
  overflow: hidden;
  cursor: pointer;
  border: 1px solid var(--border-color);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
}

.category-accent {
  height: 4px;
  width: 100%;
}

.category-body {
  display: flex;
  gap: 18px;
  padding: 22px 20px;
  align-items: flex-start;
}

.category-icon {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: color-mix(in srgb, currentColor 12%, transparent);
}

.category-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-name {
  margin: 0;
  font-size: @font-size-xl;
  font-weight: 700;
  color: var(--text-color);
  line-height: 1.3;
}

.category-desc {
  margin: 0;
  font-size: @font-size-sm;
  line-height: 1.75;
  color: var(--secondary-color);
}

.category-count {
  display: inline-block;
  align-self: flex-start;
  font-size: @font-size-xs;
  color: var(--tertiary-color);
  padding: 3px 10px;
  border-radius: 999px;
  border: 1px solid var(--border-color);
  background: var(--mute-bg-color);
}

@media (max-width: 960px) {
  .notes-grid {
    grid-template-columns: 1fr;
  }

  .category-body {
    gap: 14px;
    padding: 18px 16px;
  }

  .category-name {
    font-size: @font-size-lg;
  }
}
</style>
