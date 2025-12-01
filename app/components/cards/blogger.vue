<template>    
    <Card type="blogger" animation>
        <div class="blogger-avatar">
            <NuxtImg
                src="/img/avatar.jpg"
                alt="avatar"
                class="avatar"
                loading="eager"
                fetchpriority="high"
                quality="100"
                :width="140"
                :height="140"
            />
        </div>
        <div class="blogger-name">
            {{ name }}
        </div>
        <div class="blogger-profession">
            <nuxt-icon name="blogger/profession" />{{ $t('cards.blogger.profession') }}
        </div>
        <div class="blogger-location">
            <nuxt-icon name="blogger/location" />{{ $t('cards.blogger.location') }}
        </div>
        <div class="blogger-article">
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-statistic :title="$t('cards.blogger.stats.articles')" :value="articleCountOutput"></el-statistic>
                </el-col>
                <el-col :span="8">
                    <el-statistic :title="$t('cards.blogger.stats.categories')" :value="followCountOutput"></el-statistic>
                </el-col>
                <el-col :span="8">
                    <el-statistic :title="$t('cards.blogger.stats.tags')" :value="tagCountOutput"></el-statistic>
                </el-col>
            </el-row>
        </div>
    </Card>    
</template>

<script setup lang="ts">
import Card from './card.vue'
import { computed, onMounted } from 'vue'
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
        if (res.status === 200 && res.data.status === 200) {
          articleCount.value = Number(res.data.total || 0)
        }
      }
      if (needCategory) {
        const res = results[ai++]
        if (res.status === 200 && res.data.status === 200) {
          followCount.value = Number((res.data.data || []).length)
        }
      }
      if (needTag) {
        const res = results[ai++]
        if (res.status === 200 && res.data.status === 200) {
          tagCount.value = Number((res.data.data || []).length)
        }
      }
    } catch (e) {
    }
  }
})
</script>

<style scoped lang="less">
.blogger {
    text-align: center;
    .blogger-avatar {
        width: 140px;
        height: 140px;
        margin: 0 auto;
        margin-bottom: 12px;
        overflow: hidden;
        border-radius: @base-border-radius;
        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }
    .blogger-name {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 12px;
    }
    .blogger-profession {
        font-size: 14px;
        margin-bottom: 12px;        
        .nuxt-icon {
            margin-right: 4px;
            font-size: 18px;
        }
    }
    .blogger-location {
        font-size: 14px;
        margin-bottom: 12px;
        .nuxt-icon {
            margin-right: 4px;
            font-size: 18px;
        }
    }
    .blogger-article {
        :deep(.el-statistic__content) {
            font-size: 18px;
        }
        :deep(.el-statistic__head) {
            color: var(--secondary-color) ;
        }
        margin-bottom: 12px;
    }
}
</style>
