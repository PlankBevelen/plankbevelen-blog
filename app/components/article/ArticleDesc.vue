<template>
  <BaseCard class="article-desc" tag="article" @pointerenter="warmArticle">
    <h2 class="title-wrapper">
      <NuxtLink :to="localePath('/article/' + article.id)" class="title">
        <span v-if="article.pinned" class="pin-mark">{{ $t('pages.article.pinned') }}</span>
        {{ article.title }}
      </NuxtLink>
    </h2>
    <div class="meta">
      <span class="meta-item category">{{ article.category }}</span>
      <span class="meta-item">
        <BaseIcon name="calendar" />{{ formatDateTime(article.createTime) }}
      </span>
      <span class="meta-item">
        <BaseIcon name="clock" />{{ formatDateTime(article.updateTime) }}
      </span>
      <template v-if="(article.tags || []).length">
        <span class="meta-item meta-tag-icon"><BaseIcon name="tag" /></span>
        <span v-for="tag in article.tags" :key="tag" class="meta-item">{{ tag }}</span>
      </template>
    </div>
    <div class="content">
      <div v-if="article.previewHtml" class="md-wrapper">
        <div class="markdown-body" v-html="article.previewHtml"></div>
      </div>
      <p v-else-if="article.excerpt" class="excerpt">{{ article.excerpt }}</p>
      <div class="ops">
        <NuxtLink :to="localePath('/article/' + article.id)">
          <el-button type="primary" link size="small">{{ $t('pages.article.read') }}</el-button>
        </NuxtLink>
      </div>
    </div>
  </BaseCard>
</template>

<script lang="ts" setup>
import type { Article } from '@/types/data/article'
import { formatDateTime } from '@/utils/format'
import { prefetchArticle } from '@/utils/article-payload'

const localePath = useLocalePath()

const props = defineProps({
  article: {
    type: Object as () => Article,
    required: true,
  },
})

function warmArticle() {
  const articleId = String(props.article?.id || '')
  if (articleId) void prefetchArticle(articleId)
}
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
    .pin-mark {
      display: inline-block;
      margin-right: @space-xs;
      padding: 0 @space-2xs;
      border: 1px solid var(--primary-color);
      border-radius: @small-border-radius;
      color: var(--primary-color);
      font-size: @font-size-xs;
      font-weight: 500;
      line-height: 1.6;
      vertical-align: 2px;
    }
    &:hover {
      color: var(--primary-hover-color);
    }
  }

  .meta {
    color: var(--tertiary-color);
    font-size: @font-size-xs;
    line-height: 1.9;
    margin-bottom: @space-lg;

    .meta-item {
      display: inline-flex;
      align-items: center;
      vertical-align: middle;
      gap: @space-2xs;
      white-space: nowrap;
      margin-right: @space-base;
    }

    .meta-tag-icon {
      margin-right: @space-2xs;
    }
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: @space-base;

    :deep(.markdown-body) {
      font-size: @font-size-sm;
    }
  }
}

.md-wrapper {
  position: relative;
  overflow: hidden;
  max-height: 260px;

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

.excerpt {
  margin: 0;
  font-size: @font-size-sm;
  line-height: 1.75;
  color: var(--secondary-color);
}

.ops {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: @space-2xs;

  a {
    display: inline-flex;
  }
}
</style>
