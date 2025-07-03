<template>
    <div class="vertical-article" >
        <div class="vertical-article-image">
            <img :src="article.image" alt="article-image">
        </div>
        <div class="vertical-article-content">
            <div class="vertical-article-category">
                <span>{{ article.category }}</span>
            </div>
            <div class="vertical-article-title">
                <h3>{{ article.title }}</h3>
            </div>
            <div class="vertical-article-info">
                <span>{{ article.viewCount }}</span>
                <span>{{ article.commentCount }}</span>
            </div>
        </div>
    </div>  
</template>

<script setup lang="ts">
import { defineProps, ref } from 'vue';
import type { ArticleListItem } from '@/types/article';

const props = defineProps<{ article: ArticleListItem }>();

const article = ref(props.article);

</script>

<style scoped src="@/assets/styles/components/article/VerticalArticle.less"/>