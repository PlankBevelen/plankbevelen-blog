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
          <ArticleToc :content="article?.content || ''" />
        </template>
        <template #right>
          <BaseCard class="detailCard" tag="article">
            <h1 class="title">{{ article?.title }}</h1>
            <div class="meta">
              <span class="meta-item category">{{ articleCategory }}</span>
              <span class="meta-item">{{ timeText }}</span>
              <template v-if="(article?.tags || []).length">
                <span class="meta-item meta-tag-icon"><nuxt-icon name="article/tag" /></span>
                <span
                  v-for="tag in article?.tags || []"
                  :key="tag"
                  class="meta-item"
                  >{{ tag }}</span
                >
              </template>
            </div>
            <Suspense>
              <template #default>
                <AsyncMdPreview
                  :modelValue="displayContent"
                  :theme="currentTheme"
                  :noKatex="true"
                />
              </template>
              <template #fallback>
                <el-skeleton rows="10" animated />
              </template>
            </Suspense>
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
import { computed, defineAsyncComponent } from "vue";
import { useRoute } from "vue-router";
import { useAsyncData, navigateTo, createError } from "nuxt/app";
import http from "~/utils/http";
// 按需加载 MdPreview 与样式，避免在首页主包中引入 md-editor
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
import { formatDateTime } from "@/utils/format";
import { useAdminStore } from "@/stores/admin.store";
import articleService from "@/services/article.service";
import { useArticleSeo } from "@/composables/useSeo";
import { useSidebarData } from "@/composables/useSidebarData";

const { t } = useI18n();
const admin = useAdminStore();
const currentTheme = computed(() => admin.getTheme);
const route = useRoute();

const id = computed(() => String(route.params.id || ""));
if (!id.value) {
  await navigateTo("/article", { replace: true });
}

const { data: detailData, pending } = await useAsyncData(
  "article-detail",
  async () => {
    const rid = id.value;
    if (!rid) {
      throw createError({ statusCode: 400, statusMessage: "Bad Request", message: "参数错误" });
    }
    const res: any = await articleService.getArticle(rid);
    if (res?.status === 200) return res.data;
    return null;
  },
  { watch: [id] },
);

const article = computed(() => detailData.value || null);
const timeText = computed(() =>
  formatDateTime(article.value?.updateTime || article.value?.createTime || ""),
);
const displayContent = computed(() => String(article.value?.content || ""));

const { data: homeData } = await useSidebarData();

const stats = computed(() => homeData.value?.stats || null);
const categories = computed(() => homeData.value?.categories || []);
const articleCategory = computed(() => {
  const cid = String(article.value?.category || "");
  const c = (categories.value || []).find((x: any) => String(x.id) === cid);
  return c ? c.name : "";
});

// SEO：文章详情页使用专属 composable，处理动态数据 + ld+json + canonical 覆盖
useArticleSeo({
  id,
  title: computed(() => article.value?.title),
  content: computed(() => article.value?.content),
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

  // 每项自己是 inline-flex：对外是行内盒（跟着行内流折行），
  // 对内仍是 flex（align-items 把图标和文字垂直居中）
  //
  // vertical-align: middle 不能省。inline-flex 盒子暴露给外层行内流的基线取自
  // 它第一个 flex item：纯文字项给出真实文字基线，而图标项的第一个 item 是
  // .nuxt-icon（内部 svg 被 reset.less 设成 display: block，没有基线，只能按
  // 盒子下边缘合成），两者差几 px，category 就和图标项不在一条线上了。
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

    :deep(.nuxt-icon) {
      font-size: @font-size-md;
    }
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
