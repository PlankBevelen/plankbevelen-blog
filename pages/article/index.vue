<template>
    <TopBanner :imagePath="imagePath" :title="title" height="35vh"/>
    <div class="article">
        <div class="container">
            <!-- 浏览区域 -->
            <div class="article-browser">
              <div class="article-browser-header">
                <h1>{{ curCategory }}</h1>
              </div>
              <div class="article-browser-body">
                <div class="article-browser-body-item" v-for="(article, index) in recentArticles" >
                  <VerticalArticle :article="article" v-if="!isHorizontal"/>
                  <HorizontalArticle v-else/>
                </div>
              </div>
            </div>
            <div class="right-sidebar">

            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps, ref} from 'vue';
import type { ArticleListItem } from '@/types/article';
import TopBanner from '@/components/TopBanner.vue';
import VerticalArticle from '@/components/article/VerticalArticle.vue';
import HorizontalArticle from '@/components/article/HorizontalArticle.vue';


const imagePath = '/img/topBanner/article.jpg';
const title = '文章';
const recentArticles= ref<ArticleListItem[]>([]);

const categories = ['全部', '前端开发', '编程语言', 'CSS框架', '构建工具', '前端架构', '性能优化']
const curCategory = ref('全部')

// 选择横向还是纵向
const isHorizontal = ref(false)

onMounted(() => {
  recentArticles.value.push(
    {
      id: 1,
      title: "探索Vue3的组合式API",
      description: "深入理解Vue3带来的组合式API，提升代码组织和复用性",
      image: "https://picsum.photos/seed/vue3/600/400",
      date: "2023-05-15",
      category: "前端开发",
      viewCount: 1245,
      commentCount: 32,
      score: 4.8
    },
    {
      id: 2,
      title: "TypeScript高级类型技巧",
      description: "掌握TypeScript中的映射类型、条件类型和工具类型",
      image: "https://picsum.photos/seed/ts/600/400",
      date: "2023-05-10",
      category: "编程语言",
      viewCount: 987,
      commentCount: 23,
      score: 4.7
    },
    {
      id: 3,
      title: "Tailwind CSS v3实战指南",
      description: "如何高效使用Tailwind CSS v3构建现代响应式UI",
      image: "https://picsum.photos/seed/tailwind/600/400",
      date: "2023-05-05",
      category: "CSS框架",
      viewCount: 876,
      commentCount: 18,
      score: 4.9
    },
    {
      id: 4,
      title: "Vite构建工具详解",
      description: "从原理到实践，全面解析Vite为何如此之快",
      image: "https://picsum.photos/seed/vite/600/400",
      date: "2023-04-28",
      category: "构建工具",
      viewCount: 765,
      commentCount: 15,
      score: 4.6
    },
    {
      id: 5,
      title: "前端状态管理方案对比",
      description: "Pinia、Vuex、Redux、Zustand等主流状态管理库分析",
      image: "https://picsum.photos/seed/state/600/400",
      date: "2023-04-20",
      category: "前端架构",
      viewCount: 654,
      commentCount: 12,
      score: 4.5
    },
    {
      id: 6,
      title: "Web性能优化实战",
      description: "从加载速度到运行时性能，全方位优化Web应用",
      image: "https://picsum.photos/seed/performance/600/400",
      date: "2023-04-15",
      category: "性能优化",
      viewCount: 543,
      commentCount: 9,
      score: 4.7
    }
  )
})

</script>

<style lang="less" scoped src="@/assets/styles/pages/article.less" />