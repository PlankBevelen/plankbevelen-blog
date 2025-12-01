<template>
  <Card class="toc-card" type="toc">
    <template #header>目录</template>
    <ul class="toc-list">
      <li v-for="(item, i) in tocItems" :key="i" :class="['toc-item', 'lvl-' + item.level]" @click="onJump(item)">
        <span class="text">{{ item.title }}</span>
      </li>
    </ul>
  </Card>
</template>

<script setup lang="ts">
import Card from '@/components/cards/card.vue'
import { computed } from 'vue'

const props = defineProps({
  content: { type: String, default: '' }
})

type TocItem = { level: number; title: string }
const tocItems = computed<TocItem[]>(() => {
  const lines = (props.content || '').split('\n')
  const items: TocItem[] = []
  for (const line of lines) {
    const m = line.match(/^(#{1,6})\s+(.+)/)
    if (m) items.push({ level: m[1].length, title: m[2].trim() })
  }
  return items.slice(0, 100)
})

function onJump(item: TocItem) {
  const container = document.querySelector('.md-editor-preview') as HTMLElement | null
  if (!container) return
  const hs = Array.from(container.querySelectorAll('h1,h2,h3,h4,h5,h6')) as HTMLElement[]
  const t = hs.find(h => (h.textContent || '').trim() === item.title)
  if (!t) return
  const header = document.querySelector('.header') as HTMLElement | null
  const hh = header?.offsetHeight || 80
  const rect = t.getBoundingClientRect()
  const top = rect.top + window.scrollY - hh - 16
  window.scrollTo({ top, behavior: 'smooth' })
}
</script>

<style scoped lang="less">
.toc-card { 
  position: sticky; 
  top: calc(@header-height + 20px); 
  max-height: calc((100vh - @header-height) / 2);
}
.toc-card :deep(.card-content) {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
}
.toc-list { 
  display: flex; 
  flex-direction: column; 
  gap: @base-gap; 
  margin-bottom: 20px;
  .toc-item { 
    cursor: pointer; 
    border-radius: @small-border-radius; 
    padding: 4px 6px; 
    &:hover {
      background-color: var(--shallow-hover-bg-color);
    }
    .text {
      font-size: 13px;
      line-height: 20px;
      color: var(--text-color);
    }
    &.lvl-1 {
      font-weight: 600;
    }
    &.lvl-2 {
      padding-left: 8px;
    }
    &.lvl-3 {
      padding-left: 16px;
    }
    &.lvl-4 {
      padding-left: 24px;
    }
    &.lvl-5 {
      padding-left: 32px;
    }
    &.lvl-6 {
      padding-left: 40px;
    }
  }
}
</style>
