<template>
  <BaseCard class="article-desc" tag="article">
    <h2 class="title-wrapper">
      <NuxtLink :to="localePath('/article/' + article.id)" class="title">
        {{ article.title }}
      </NuxtLink>
    </h2>
    <div class="meta">
      <span class="meta-item category">{{ article.category }}</span>
      <span class="meta-item">
        <nuxt-icon name="article/create-time" />{{ formatDateTime(article.createTime) }}
      </span>
      <span class="meta-item">
        <nuxt-icon name="article/update-time" />{{ formatDateTime(article.updateTime) }}
      </span>
      <template v-if="(article.tags || []).length">
        <span class="meta-item meta-tag-icon"><nuxt-icon name="article/tag" /></span>
        <span v-for="tag in article.tags" :key="tag" class="meta-item">{{ tag }}</span>
      </template>
    </div>
    <div class="content">
      <div class="md-wrapper" :class="{ 'is-collapsed': !isExpand }">
        <Suspense>
          <template #default>
            <AsyncMdPreview
              :modelValue="displayContent"
              :theme="currentTheme"
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
        <NuxtLink :to="localePath('/article/' + article.id)">
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

  // 容器不用 flex，交给行内流：片段像段落里的词一样逐个折行
  .meta {
    color: var(--tertiary-color);
    font-size: @font-size-xs;
    line-height: 1.9;
    margin-bottom: @space-lg;

    // 每项自己是 inline-flex：对外是行内盒（能跟着行内流折行），
    // 对内仍是 flex（align-items 把图标和文字垂直居中）
    //
    // vertical-align: middle 是必须的，不能用默认的 baseline。inline-flex 盒子
    // 暴露给外层行内流的基线取自它第一个 flex item：纯文字项给出真实文字基线，
    // 而图标开头的项，第一个 item 是 .nuxt-icon（内部 svg 被 reset.less 设成
    // display: block，没有基线，只能按盒子下边缘合成），两者差几 px，
    // 于是 category 和带图标的项就不在一条线上了。
    // 各项高度都由 line-height 决定、内容又都各自居中，改成按盒子中线对齐后
    // 内容自然落在同一条水平线上。
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

  a {
    display: inline-flex;
  }
}
</style>
