<template>
  <div class="article-detail">
    <div class="container">
      <LayoutTwoColumn :loading="pending" type="rightbigger">
        <template #left>
          <WidgetBlogger
            :articleCount="stats?.articles || 0"
            :categoryCount="stats?.categories || 0"
            :tagCount="stats?.tags || 0"
          />
          <ArticleToc :items="article?.toc || []" />
        </template>
        <template #right>
          <BaseCard class="detailCard" tag="article">
            <h1 class="title">
              <span v-if="article?.pinned" class="pin-mark">{{ $t('pages.article.pinned') }}</span>
              {{ article?.title }}
            </h1>
            <div class="meta">
              <span class="meta-item category">{{ articleCategory }}</span>
              <span class="meta-item">{{ timeText }}</span>
              <template v-if="(article?.tags || []).length">
                <span class="meta-item meta-tag-icon"><BaseIcon name="tag" /></span>
                <span
                  v-for="tag in article?.tags || []"
                  :key="tag"
                  class="meta-item"
                  >{{ tag }}</span
                >
              </template>
            </div>
            <div class="markdown-body" v-html="articleHtml"></div>
            <div class="prev-next">
              <div class="item prev" v-if="article?.prev">
                <NuxtLink
                  :to="{ path: '/article/' + article.prev.id }"
                  class="link"
                  >{{ $t("pages.article.articleDetail.prev") }}：{{
                    article.prev.title
                  }}</NuxtLink
                >
              </div>
              <div class="item next" v-if="article?.next">
                <NuxtLink
                  :to="{ path: '/article/' + article.next.id }"
                  class="link"
                  >{{ $t("pages.article.articleDetail.next") }}：{{
                    article.next.title
                  }}</NuxtLink
                >
              </div>
            </div>
          </BaseCard>
        </template>
      </LayoutTwoColumn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useAsyncData, navigateTo, createError } from "nuxt/app";
import { formatDateTime } from "@/utils/format";
import { articleDataKey, prefetchArticle, readArticleCache } from "@/utils/article-payload";
import { useArticleSeo } from "@/composables/useSeo";
import { useSidebarData } from "@/composables/useSidebarData";

const { t } = useI18n();
const route = useRoute();

const id = computed(() => String(route.params.id || ""));
if (!id.value) {
  await navigateTo("/article", { replace: true });
}

const { data: detailData, pending } = await useAsyncData(
  () => articleDataKey(id.value),
  async () => {
    const rid = id.value;
    if (!rid) {
      throw createError({ statusCode: 400, statusMessage: "Bad Request", message: "参数错误" });
    }
    return await prefetchArticle(rid);
  },
  {
    watch: [id],
    getCachedData: (key) => readArticleCache(key),
  },
);

const article = computed(() => detailData.value || null);
const timeText = computed(() =>
  formatDateTime(article.value?.updateTime || article.value?.createTime || ""),
);
const articleHtml = computed(() => String(article.value?.html || ""));

if (import.meta.client) {
  watch(article, (value) => {
    const warmNeighbors = () => {
      if (value?.prev?.id) void prefetchArticle(String(value.prev.id))
      if (value?.next?.id) void prefetchArticle(String(value.next.id))
    }
    if (typeof requestIdleCallback === "function") requestIdleCallback(warmNeighbors)
    else setTimeout(warmNeighbors, 200)
  }, { immediate: true })
}

const { data: homeData } = await useSidebarData();

const stats = computed(() => homeData.value?.stats || null);
const articleCategory = computed(() => article.value?.category || "");

useArticleSeo({
  id,
  title: computed(() => article.value?.title),
  excerpt: computed(() => article.value?.excerpt),
  cover: computed(() => article.value?.cover),
  tags: computed(() => article.value?.tags || []),
  createTime: computed(() => article.value?.createTime),
  updateTime: computed(() => article.value?.updateTime),
});
</script>

<style lang="less" scoped>
.article-detail {
  min-height: 100vh;
  padding-top: @header-height;
  .container {
    padding-top: @space-5xl;
    padding-bottom: @space-5xl;
  }
}
.detailCard {
  :deep(.card-content) {
    padding: @space-5xl @space-5xl @space-3xl @space-5xl;
  }
}
.title {
  font-size: @font-size-xxl;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: @space-3xl;
  text-align: center;
}

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
  vertical-align: 4px;
}
// 容器不用 flex，交给行内流：片段像段落里的词一样逐个折行，
// 不会因为宽度不够就让整项掉到下一行、上一行留大片空白
.meta {
  text-align: center;
  line-height: 1.9;
  color: var(--secondary-color);
  font-size: @font-size-sm;
  margin-bottom: @space-5xl;
  padding-bottom: @space-3xl;
  border-bottom: 1px solid var(--border-color);

  .meta-item {
    display: inline-flex;
    align-items: center;
    vertical-align: middle;
    gap: @space-2xs;
    white-space: nowrap;
    margin: 0 @space-xs;
  }

  .category {
    color: var(--primary-color);
  }

  // 标签图标是后面这串标签的引导符，贴近第一个标签
  .meta-tag-icon {
    margin-right: 0;
  }
}
.prev-next {
  margin-top: @space-5xl;
  padding-top: @space-3xl;
  border-top: 1px solid var(--border-color);
  display: flex;
  width: 100%;
  justify-content: space-between;
  .item {
    font-size: @font-size-sm;
    color: var(--secondary-color);
    .link {
      color: var(--text-color);
      text-decoration: none;
      transition: color @transition-base;
      &:hover {
        color: var(--primary-color);
      }
    }
  }
}
</style>
