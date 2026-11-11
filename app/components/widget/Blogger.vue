<template>    
  <BaseCard type="blogger" animation class="text-center">
    <div class="mx-auto mb-3 h-[200px] w-[200px] overflow-hidden">
      <img
        src="/img/avatar.webp?v=20260822"
        alt="avatar"
        class="h-full w-full object-cover"  
      />
    </div>
    <div class="mb-3 text-title font-bold text-text">
      {{ name }}
    </div>
    <div class="mb-3 flex items-center justify-center gap-1.5 text-sm leading-none text-text">
      <BaseIcon name="briefcase" />
      <span>{{ $t('blogger.profession') }}</span>
    </div>
    <div class="mb-3 flex items-center justify-center gap-1.5 text-sm leading-none text-text">
      <BaseIcon name="map-pin" />
      <span>{{ $t('blogger.location') }}</span>
    </div>
    <div class="mb-3 flex items-center justify-between max-w-[75%] mx-auto text-[18px] leading-none text-text py-1 px-4">
      <button
        v-for="link in links"
        :key="link.icon"
        type="button"
        class="inline-flex cursor-pointer text-text hover:text-[var(--active-color)]"
        :aria-label="link.label"
        @click="handleClick(link.url)"
      >
        <BaseIcon :name="link.icon" />
      </button>
    </div>
    <div class="blogger-stats">
      <div>
        <div class="text-secondary">{{ $t('blogger.stats.articles') }}</div>
        <div class="blogger-stat-value">{{ articleShown }}</div>
      </div>
      <div>
        <div class="text-secondary">{{ $t('blogger.stats.categories') }}</div>
        <div class="blogger-stat-value">{{ categoryShown }}</div>
      </div>
      <div>
        <div class="text-secondary">{{ $t('blogger.stats.tags') }}</div>
        <div class="blogger-stat-value">{{ tagShown }}</div>
      </div>
    </div>
  </BaseCard>    
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useTransition } from '@vueuse/core'
import articleService from '@/services/article'
import categoryService from '@/services/category'
import tagService from '@/services/tag'
import type { PageResult } from '@/types/common/api'
import type { Article } from '@/types/data/article'
import type { Category } from '@/types/data/category'
import type { Tag } from '@/types/data/tag'

const name = 'plankbevelen'

const props = defineProps<{ articleCount?: number; categoryCount?: number; tagCount?: number }>()
const articleCount = ref(0)
const followCount = ref(0)
const tagCount = ref(0)
watch(() => props.articleCount, (v) => { articleCount.value = v || 0 }, { immediate: true })
watch(() => props.categoryCount, (v) => { followCount.value = v || 0 }, { immediate: true })
watch(() => props.tagCount, (v) => { tagCount.value = v || 0 }, { immediate: true })
const articleCountOutput = useTransition(articleCount, { duration: 1000 })
const followCountOutput = useTransition(followCount, { duration: 1000 })
const tagCountOutput = useTransition(tagCount, { duration: 1000 })
const articleShown = computed(() => Math.round(articleCountOutput.value))
const categoryShown = computed(() => Math.round(followCountOutput.value))
const tagShown = computed(() => Math.round(tagCountOutput.value))

const links = [
  { icon: 'github' as const, label: 'GitHub', url: 'https://github.com/PlankBevelen' },
  { icon: 'juejin' as const, label: '掘金', url: 'https://juejin.cn/user/1057085717486684' },
  { icon: 'gmail' as const, label: '邮箱', url: 'mailto:plankbevelen@gmail.com' },
]
function handleClick(url: string) {
  if (url.startsWith('mailto')) {
    window.location.href = url
  } else {
    window.open(url, '_blank')
  }
}

onMounted(async () => {
  const needArticle = !props.articleCount || props.articleCount === 0
  const needCategory = !props.categoryCount || props.categoryCount === 0
  const needTag = !props.tagCount || props.tagCount === 0
  if (needArticle || needCategory || needTag) {
    try {
      const tasks: Array<Promise<PageResult<Article[]> | Category[] | Tag[]>> = []
      if (needArticle) tasks.push(articleService.getArticles(1, 10))
      if (needCategory) tasks.push(categoryService.getCategories())
      if (needTag) tasks.push(tagService.getTags())
      const results = await Promise.all(tasks)
      let ai = 0
      if (needArticle) {
        const res = results[ai++] as PageResult<Article[]>
        articleCount.value = Number(res.total || 0)
      }
      if (needCategory) {
        const res = results[ai++] as Category[]
        followCount.value = Number((res || []).length)
      }
      if (needTag) {
        const res = results[ai++] as Tag[]
        tagCount.value = Number((res || []).length)
      }
    } catch {
      // ignore
    }
  }
})
</script>

<style scoped>
.blogger-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  text-align: center;
}
.blogger-stat-value {
  margin-top: 4px;
  font-size: 20px;
  color: var(--text-color);
}
</style>
