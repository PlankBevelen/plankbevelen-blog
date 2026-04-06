<template>
  <div class="article-detail">
    <div class="container">
      <TwoColumnLayout :loading="pending" type="rightbigger">
        <template #left>
          <BloggerCard
            :articleCount="stats?.articles || 0"
            :categoryCount="stats?.categories || 0"
            :tagCount="stats?.tags || 0"
          />
          <Toc :content="article?.content || ''" />
        </template>
        <template #right>
          <Card class="detailCard" tag="article">
            <h1 class="title">{{ article?.title }}</h1>
            <div class="meta">
              <span class="category">{{ articleCategory }}</span>
              <span class="dot">·</span>
              <span class="time">{{ timeText }}</span>
              <div class="tags" v-if="(article?.tags || []).length">
                <nuxt-icon name="article/tag" />
                <span v-for="tag in article?.tags || []" :key="tag">{{
                  tag
                }}</span>
              </div>
            </div>
            <MdPreview
              :modelValue="displayContent"
              :theme="currentTheme"
              :noMermaid="true"
              :noKatex="true"
            />
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
          </Card>
        </template>
      </TwoColumnLayout>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useAsyncData, navigateTo, createError } from "nuxt/app";
import http from "~/utils/http";
import Card from "@/components/cards/card.vue";
import TwoColumnLayout from "@/components/layouts/TwoColumnLayout.vue";
import BloggerCard from "@/components/cards/blogger.vue";
import { MdPreview } from "md-editor-v3";
import "md-editor-v3/lib/style.css";
import { formatDateTime } from "@/utils/format";
import { useAdminStore } from "@/stores/admin.store";
import Toc from "@/components/article/toc.vue";
import articleService from "@/services/article.service";
import { useArticleSeo } from "@/composables/useSeo";

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
    if (!rid) throw createError({ statusCode: 400, statusMessage: "参数错误" });
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

const { data: homeData } = await useAsyncData(
  "article-detail-home-data",
  async () => {
    const res: any = await http.get("/home.data");
    if (res?.status === 200) return res.data;
    return null;
  },
);

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
    padding: 40px 0;
  }
}
.detailCard {
  :deep(.card-content) {
    padding: 40px 40px 20px 40px;
  }
}
.title {
  font-size: @font-size-xxl;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 20px;
  text-align: center;
}
.meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--secondary-color);
  font-size: @font-size-sm;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
  .category {
    color: var(--primary-color);
  }
  .dot {
    font-weight: bold;
  }
  .tags {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-left: 12px;
    :deep(.nuxt-icon) {
      font-size: @font-size-md;
    }
  }
}
.prev-next {
  margin-top: 40px;
  padding-top: 20px;
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
      transition: color 0.3s;
      &:hover {
        color: var(--primary-color);
      }
    }
  }
}
</style>
