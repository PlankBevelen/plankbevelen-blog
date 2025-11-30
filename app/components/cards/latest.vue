<template>
  <Card type="latest">
    <template #header>
      最新文章
    </template>
    <ul class="latestList">
      <li v-for="item in latestList" :key="item.title + item.createTime" class="latest-item">
        <div class="left">
          <div class="title">{{ item.title }}</div>
          <div class="category">{{ item.category }}</div>
        </div>
        <div class="right">
          <span class="time">{{ formatDateTime(item.createTime) }}</span>
        </div>
      </li>
    </ul>
  </Card>
  
</template>

<script setup lang="ts">
import Card from './card.vue'
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

type LatestItem = Pick<Article, 'title' | 'category' | 'createTime'>
const fallback = ref<LatestItem[]>([])
const latestList = computed<LatestItem[]>(() => {
  if (props.articles && props.articles.length > 0) {
    return props.articles.map((a) => ({ title: a.title, category: a.category, createTime: a.createTime }))
  }
  return fallback.value
})

onMounted(async () => {
  if (!props.articles || props.articles.length === 0) {
    const res = await articleService.getArticles(1, 5, undefined, 'created')
    if (res.status === 200 && res.data.status === 200) {
      const list: Article[] = res.data.data || []
      fallback.value = list.slice(0, 5).map((a) => ({ title: a.title, category: a.category, createTime: a.createTime }))
    }
  }
})

</script>

<style scoped lang="less">
.latestList { display: flex; flex-direction: column; gap: @base-gap; }
.latest-item { 
  display: grid; grid-template-columns: 1fr auto; align-items: center; 
  border-radius: @small-border-radius; padding: 6px 8px; 
}
.left { display: flex; flex-direction: column; gap: 4px; }
.title { font-size: 14px; color: var(--primary-color); }
.category { font-size: 12px; color: var(--tertiary-color); }
.right .time { font-size: 12px; color: var(--tertiary-color); }
</style>

