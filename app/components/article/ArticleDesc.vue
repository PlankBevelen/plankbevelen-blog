<template>
  <BaseCard class="article-desc" tag="article">
    <h2 class="title-wrapper">
      <NuxtLink :to="localePath('/article/' + article.id)" class="title">
        {{ article.title }}
      </NuxtLink>
    </h2>
    <div class="meta">
      <span class="meta-item category">{{ article.category }}</span>
      <span class="dot">·</span>
      <span class="meta-item">
        <nuxt-icon name="article/create-time" />
        <span>{{ formatDateTime(article.createTime) }}</span>
      </span>
      <span class="meta-item">
        <nuxt-icon name="article/update-time" />
        <span>{{ formatDateTime(article.updateTime) }}</span>
      </span>
      <span v-if="article.tags?.length" class="meta-item tags">
        <nuxt-icon name="article/tag" />
        <span class="tag-list">
          <span v-for="tag in article.tags" :key="tag" class="tag">{{ tag }}</span>
        </span>
      </span>
    </div>
    <div class="content">
      <div class="md-wrapper" :class="{ 'is-collapsed': !isExpand }">
        <Suspense>
          <template #default>
            <AsyncMdPreview
              :modelValue="displayContent"
              :theme="currentTheme"
              :noMermaid="true"
              :noKatex="true"
              previewOnly
            />
          </template>
          <template #fallback>
            <div class="md-editor-preview" v-html="displayHtml"></div>
          </template>
        </Suspense>
      </div>
      <div class="ops">
        <el-button type="primary" link size="small" @click="isExpand = !isExpand">
          {{ isExpand ? '收起' : '展开更多' }}
        </el-button>
        <NuxtLink :to="localePath('/article/' + article.id)" class="read-more-link">
          <el-button type="primary" link size="small">阅读全文</el-button>
        </NuxtLink>
      </div>
    </div>
  </BaseCard>
</template>

<script lang="ts" setup>
import { ref, computed, defineAsyncComponent } from 'vue'
import type { Article } from '@/types/article'
import { formatDateTime } from '@/utils/format'
import { useAdminStore } from '@/stores/admin.store'

const localePath = useLocalePath()
const admin = useAdminStore()
const currentTheme = computed(() => admin.getTheme)

const props = defineProps({
  article: {
    type: Object as () => Article & { shortContent?: string; longContent?: string; shortHtml?: string; longHtml?: string },
    required: true,
  },
})

const isExpand = ref(false)

// 折叠时展示 shortContent，展开后展示 longContent
// 两份数据都从接口一次性拿好，不需要额外请求
// markdown 字符串用于 MdPreview 的 modelValue
const displayContent = computed(() =>
  isExpand.value
    ? (props.article.longContent || props.article.shortContent || '')
    : (props.article.shortContent || '')
)

// 回退使用服务端渲染的 HTML（已在服务端 sanitize）
const displayHtml = computed(() =>
  isExpand.value
    ? (props.article.longHtml || '')
    : (props.article.shortHtml || '')
)

// 异步加载 MdPreview 与样式，使用全局缓存避免重复加载
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
</script>

<style scoped lang="less">
.article-desc {
  line-height: normal;
  height: auto;

  .title-wrapper {
    margin: 0;
    margin-bottom: @space-lg;
    line-height: normal;
  }

  .title {
    font-size: @font-size-xxl;
    font-weight: 500;
    color: var(--primary-color);
    cursor: pointer;
    text-decoration: none;
    line-height: normal;
    display: block;
    &:hover {
      color: var(--primary-hover-color);
    }
  }

  .meta {
    color: var(--tertiary-color);
    font-size: @font-size-xs;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    column-gap: @space-lg;
    row-gap: @space-xs;
    margin-bottom: @space-lg;

    .meta-item {
      display: inline-flex;
      align-items: center;
      gap: @space-2xs;
      min-width: 0;
      max-width: 100%;
      flex: 0 1 auto;
    }

    .category {
      color: var(--primary-color);
    }

    .tags {
      align-items: flex-start;
    }

    .tag-list {
      display: inline-flex;
      flex-wrap: wrap;
      gap: @space-2xs @space-base;
    }

    .tag {
      white-space: nowrap;
    }
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: @space-base;

    :deep(.md-editor-preview) {
      font-size: @font-size-sm !important;
    }
  }
}

.md-wrapper {
  position: relative;
  overflow: hidden;
  // 展开态自然高度
}

// 折叠态限制最大高度，超出渐隐
.md-wrapper.is-collapsed {
  max-height: 260px;

  // 底部渐隐遮罩，提示用户有更多内容
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: linear-gradient(to bottom, transparent, var(--card-color));
    pointer-events: none;
  }
}

.ops {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: @space-2xs;

  .read-more-link {
    display: inline-flex;
    align-items: center;
  }
}
</style>
