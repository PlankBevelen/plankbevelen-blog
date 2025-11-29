<template>
    <div class="home">
        <div class="container">
            <ThreeColumnLayout>
                <template #left class="left">
                    <BloggerCard :articleCount="stats?.articles || 0" :categoryCount="stats?.categories || 0" :tagCount="stats?.tags || 0" />
                    <RecordLinkCard />
                </template>
                <template #middle>
                    <ArticleList single :articleList="articles"/>
                </template>
                <template #right>
                    <CategoryCard :categories="categories" />
                    <TagCard :tags="tags" />
                </template>
            </ThreeColumnLayout>
        </div>        
    </div>
</template>

<script setup lang="ts">
import ThreeColumnLayout from '@/components/layouts/ThreeColumnLayout.vue'
import BloggerCard from '@/components/cards/blogger.vue'
import RecordLinkCard from '@/components/cards/recordLink.vue'
import ArticleList from '@/components/article/articleList.vue'
import CategoryCard from '@/components/cards/category.vue'
import TagCard from '@/components/cards/tag.vue'
import { ref, onMounted } from 'vue'

const articles = ref<any[]>([])
const categories = ref<any[]>([])
const tags = ref<any[]>([])
const stats = ref<{ articles: number; categories: number; tags: number } | null>(null)

onMounted(async () => {
  try {
    const res = await $fetch('/api/home.data') as any
    console.log(res)
    if (res && res.status === 200) {
      articles.value = res.data?.articles || []
      categories.value = res.data?.categories || []
      tags.value = res.data?.tags || []
      stats.value = res.data?.stats || null
    }
  } catch (error) { console.log(error) }
})

</script>

<style lang="less" scoped>
.home {
    min-height: 100vh;
    padding-top: @header-height;
    .container {
        padding: 40px 0;
    }
}
</style>
