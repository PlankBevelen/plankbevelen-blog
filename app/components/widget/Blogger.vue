<template>    
  <BaseCard type="blogger" animation class="text-center">
    <div class="mx-auto mb-3 h-[140px] w-[140px] overflow-hidden rounded-card">
      <NuxtImg
        provider="ipx"
        src="/img/avatar.webp"
        alt="avatar"
        class="h-full w-full object-cover"
        loading="eager"
        fetchpriority="high"
        quality="60"
        :width="140"
        :height="140"
      />
    </div>
    <div class="mb-3 text-title font-bold text-text">
      {{ name }}
    </div>
    <div class="mb-3 flex items-center justify-center gap-1 text-sm text-text">
      <nuxt-icon name="blogger/profession" class="text-title" />
      <span>{{ $t('blogger.profession') }}</span>
    </div>
    <div class="mb-3 flex items-center justify-center gap-1 text-sm text-text">
      <nuxt-icon name="blogger/location" class="text-title" />
      <span>{{ $t('blogger.location') }}</span>
    </div>
    <div class="mb-3 flex items-center justify-between max-w-[75%] mx-auto text-sm text-text py-1 px-4">
      <nuxt-icon 
        v-for="link in links"
        :key="link.icon"
        :name="link.icon"
        class="text-title hover:text-[var(--active-color)] cursor-pointer"
        @click="handleClick(link.url)"
      />
    </div>
    <div class="mb-0">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-statistic
            :value="articleCountOutput"
            :value-style="{ fontSize: '20px', color: 'var(--text-color)' }"
          >
            <template #title>
              <span class="text-secondary">{{ $t('blogger.stats.articles') }}</span>
            </template>
          </el-statistic>
        </el-col>
        <el-col :span="8">
          <el-statistic
            :value="followCountOutput"
            :value-style="{ fontSize: '20px', color: 'var(--text-color)' }"
          >
            <template #title>
              <span class="text-secondary">{{ $t('blogger.stats.categories') }}</span>
            </template>
          </el-statistic>
        </el-col>
        <el-col :span="8">
          <el-statistic
            :value="tagCountOutput"
            :value-style="{ fontSize: '20px', color: 'var(--text-color)' }"
          >
            <template #title>
              <span class="text-secondary">{{ $t('blogger.stats.tags') }}</span>
            </template>
          </el-statistic>
        </el-col>
      </el-row>
    </div>
  </BaseCard>    
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useTransition } from '@vueuse/core'
import articleService from '@/services/article.service'
import categoryService from '@/services/category.service'
import tagService from '@/services/tag.service'

const name = 'PlankBevelen'

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

const links = ref([
  { icon: 'github', url: 'https://github.com/PlankBevelen' },
  { icon: 'juejin', url: 'https://juejin.cn/user/1057085717486684' },
  { icon: 'gmail', url: 'mailto:plankbevelen@gmail.com' }
])
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
      const tasks: Promise<any>[] = []
      if (needArticle) tasks.push(articleService.getArticles(1, 10))
      if (needCategory) tasks.push(categoryService.getCategories())
      if (needTag) tasks.push(tagService.getTags())
      const results = await Promise.all(tasks)
      let ai = 0
      if (needArticle) {
        const res = results[ai++]
        if (res.status === 200) {
          articleCount.value = Number(res.total || 0)
        }
      }
      if (needCategory) {
        const res = results[ai++]
        if (res.status === 200) {
          followCount.value = Number((res.data || []).length)
        }
      }
      if (needTag) {
        const res = results[ai++]
        if (res.status === 200) {
          tagCount.value = Number((res.data || []).length)
        }
      }
    } catch (e) {
    }
  }
})
</script>
