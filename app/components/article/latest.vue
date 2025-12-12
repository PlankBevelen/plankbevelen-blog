<template>
  <Card type="latest">
    <template #header>
      {{ $t('cards.latest.title') }}
    </template>
    <ul class="latestList">
      <li v-for="item in latestList" :key="item.id" class="latest-item">  
        <NuxtLink :to="{path: '/article/detail', query: { id: item.id }}">
          <div class="time">{{ formatDateTime(item.createTime) }}</div>
          <div class="title">{{ item.title }}</div>
          <div class="category">{{ item.category }}</div>
        </NuxtLink>      
      </li>
    </ul>
  </Card>
  
</template>

<script setup lang="ts">
import Card from '@/components/cards/card.vue'
import { ref, computed, onMounted } from 'vue'
import { formatDateTime } from '@/utils/format'
import articleService from '@/services/article.service'
import type { Article } from '@/types/article'

const props = defineProps({
  articles: {
    type: Array as () => Article[],
    default: () => []
  }
})

type LatestItem = Pick<Article, 'id' | 'title' | 'category' | 'createTime'>
const fallback = ref<LatestItem[]>([])
const latestList = computed<LatestItem[]>(() => {
  if (props.articles && props.articles.length > 0) {
    return props.articles.map((a) => ({ id: a.id, title: a.title, category: a.category, createTime: a.createTime }))
  }
  return fallback.value
})

onMounted(async () => {
  if (!props.articles || props.articles.length === 0) {
    const res = await articleService.getArticles(1, 5, undefined, 'created')
    if (res.status === 200 && res.data.status === 200) {
      const list: Article[] = res.data.data || []
      fallback.value = list.slice(0, 5).map((a) => ({ id: a.id, title: a.title, category: a.category, createTime: a.createTime }))
    }
  }
})

</script>

<style scoped lang="less">
.latestList { 
  position: relative;  
  .latest-item {
    display: block;    
    line-height: 20px;
    cursor: pointer;
    border-radius: @small-border-radius;
    padding: 6px 8px;
    &:hover { background-color: var(--shallow-hover-bg-color); }
    &:not(:last-child) {
      margin-bottom: @base-gap;
    }
    a { text-decoration: none; }
    .title {
      font-size: 14px;
      color: var(--text-color);
      line-height: normal;
    }
    .category {
      font-size: 12px;
      color: var(--tertiary-color);
    }
    .time {
      font-size: 12px;
      color: var(--tertiary-color);
    }
  }
}

</style>
