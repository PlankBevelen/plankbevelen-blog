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
      <div class="md-wrapper" :class="{ 'is-collapsed': !isExpand }">
        <div class="markdown-body" v-html="displayHtml"></div>
      </div>
      <div class="ops">
        <el-button type="primary" link size="small" @click="isExpand = !isExpand">
          {{ isExpand ? '收起' : '展开更多' }}
        </el-button>
        <NuxtLink :to="localePath('/article/' + article.id)">
          <el-button type="primary" link size="small">阅读全文</el-button>
        </NuxtLink>
      </div>
    </div>
  </BaseCard>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { Article } from '@/types/data/article'
import { formatDateTime } from '@/utils/format'
import { prefetchArticle } from '@/utils/article-payload'

const localePath = useLocalePath()

function warmArticle() {
  const articleId = String(props.article?.id || '')
  if (articleId) void prefetchArticle(articleId)
}

const props = defineProps({
  article: {
    type: Object as () => Article,
    required: true,
  },
})

const isExpand = ref(false)

const displayHtml = computed(() =>
  isExpand.value
    ? (props.article.longHtml || props.article.shortHtml || '')
    : (props.article.shortHtml || '')
)
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

  // 容器不用 flex，交给行内流：片段像段落里的词一样逐个折行
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

    // 标签图标是后面这串标签的引导符，贴近第一个标签
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

  a {
    display: inline-flex;
  }
}
</style>
