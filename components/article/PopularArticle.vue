<template>
    <div class="popular-article">
        <img :src="article.image" alt="article title">
        <p class="popular-article-date">{{ article.date }}</p>
        <h2 class="popular-article-title">{{ article.title }}</h2>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ArticleListItem } from '@/types/article';

const props = defineProps<{ article: ArticleListItem }>();
const article = props.article;


</script>

<style scoped lang="less">
.popular-article {
    position: relative;

    img {
        width: 100%;
        height: auto;
        object-fit: cover;
        margin-bottom: 8px;
    }
    .popular-article-date {
        color: var(--primary-color);
        margin-bottom: 18px;
    }
    .popular-article-title {
        font-family:Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;
        font-size: 1.4rem;
    }
}
</style>