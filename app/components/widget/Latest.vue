<template>
  <BaseCard type="latest">
    <template #header>
      {{ $t('latest.title') }}
    </template>
    <ul v-if="latestList.length" class="latestList">
      <li v-for="item in latestList" :key="item.id" class="latest-item">  
        <NuxtLink :to="localePath('/article/' + item.id)">
          <div class="time">{{ formatDateTime(item.createTime) }}</div>
          <div class="title">{{ item.title }}</div>
          <div class="category">{{ item.category }}</div>
        </NuxtLink>      
      </li>
    </ul>
    <div v-else class="latest-empty">{{ $t('latest.empty') }}</div>
  </BaseCard>
  
</template>

<script setup lang="ts">

import { computed } from 'vue'
const localePath = useLocalePath()
import { formatDateTime } from '@/utils/format'
import type { Article } from '@/types/article'

const props = defineProps({
  articles: {
    type: Array as () => Article[],
    default: () => []
  }
})

type LatestItem = Pick<Article, 'id' | 'title' | 'category' | 'createTime'>
const latestList = computed<LatestItem[]>(() => {
  return (props.articles || []).map((a) => ({
    id: a.id,
    title: a.title,
    category: a.category,
    createTime: a.createTime
  }))
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
    padding: @space-xs @space-base;
    &:hover { background-color: var(--shallow-hover-bg-color); }
    &:not(:last-child) {
      margin-bottom: @space-base;
    }
    a { text-decoration: none; }
    .title {
      font-size: @font-size-sm;
      color: var(--text-color);
      line-height: normal;
    }
    .category {
      font-size: @font-size-xs;
      color: var(--tertiary-color);
    }
    .time {
      font-size: @font-size-xs;
      color: var(--tertiary-color);
    }
  }
}

.latest-empty {
  font-size: @font-size-sm;
  color: var(--tertiary-color);
}

</style>
