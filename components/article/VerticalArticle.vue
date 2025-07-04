<template>
    <div class="vertical-article">
        <div class="vertical-article-image">
            <img :src="article.image" alt="Article Image">
            <div class="vertical-article-info left">
                <span>{{ article.date }}</span>
                <span><el-icon><Star/></el-icon>{{ article.score }}</span>
            </div>
            <div class="vertical-article-info right">
                <span><el-icon><View/></el-icon>{{ article.viewCount }}</span>
                <span><el-icon><ChatRound/></el-icon>{{ article.commentCount }}</span>
            </div>
        </div>
        <div class="vertical-article-content">
            <div class="vertical-article-category">
                <span>{{ article.category }}</span>
            </div>
            <div class="vertical-article-title">
                <span>{{ article.title }}</span>
            </div>
            <span class="vertical-article-more">了解更多</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import type { ArticleListItem } from '@/types/article';
import { View, ChatRound, Star } from '@element-plus/icons-vue';

const props = defineProps<{ article: ArticleListItem }>();

const article = props.article;

</script>

<style scoped src="@/assets/styles/components/article/VerticalArticle.less"/>