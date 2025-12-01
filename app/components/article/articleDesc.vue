<template>
    <Card class="article-desc">
        <NuxtLink :to="{ path: '/article/detail', query: { id: article.id } }" class="title">{{ article.title }}</NuxtLink>
        <div class="meta">
            <span class="category">{{ article.category }}</span>
            <span class="dot">·</span>
            <span class="create-time"><nuxt-icon name="article/create-time" /> {{ formatDateTime(article.createTime) }}</span>
            <span class="update-time"><nuxt-icon name="article/update-time" /> {{ formatDateTime(article.updateTime) }}</span>
            <div class="tags">
                <nuxt-icon name="article/tag" />
                <span v-for="tag in article.tags" :key="tag">{{ tag }}</span>
            </div>
        </div>
        <div class="content">
            <div class="md-wrapper" :class="{ 'is-collapsed': !isExpand }">
                <MdPreview :modelValue="displayContent" :theme="currentTheme" :noMermaid="true" :noKatex="true" previewOnly/>
            </div>
            <div class="ops">
                <el-button type="primary" link size="small" @click="isExpand = !isExpand">{{ isExpand ? '收起' : '展开更多' }}</el-button>
            </div>
        </div>
    </Card>
</template>

<script lang="ts" setup>
import type { Article } from '@/types/article'
import Card from '@/components/cards/card.vue'
import { ref, computed } from 'vue'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { formatDateTime } from '@/utils/format'
import { useAdminStore } from '@/stores/admin.store'

const admin = useAdminStore()
const currentTheme = computed(() => admin.getTheme)

const props = defineProps({
    article: {
        type: Object as () => Article,
        required: true
    }
})

const atLeastLines = ref(20)
const maxLines = ref(60)
const isExpand = ref(false)
const displayContent = computed(() => {
    if (isExpand.value) {
        return props.article.content.split('\n').slice(0, maxLines.value).join('\n')
    }
    return props.article.content.split('\n').slice(0, atLeastLines.value).join('\n')
})

</script>

<style scoped lang="less">
.article-desc {
    line-height: normal;
    .title {
        font-size: 28px;
        font-weight: 500;
        color: var(--primary-color);
        cursor: pointer;
        margin-bottom: 12px;
        text-decoration: none;
        line-height: normal;
        display: block;
        &:hover { color: var(--primary-hover-color); }
    }
    .meta {
        color: var(--tertiary-color);
        font-size: 12px;
        display: flex;
        gap: 8px;
        text-wrap: auto;
        .tags {
            display: flex;
            gap: 4px;
            font-size: 12px;
        }
    }
    
    .content {
        display: flex;
        flex-direction: column;
        gap: 8px;
        :deep(.md-editor-preview) {
            font-size: 14px !important;
        }
    }
}

.md-wrapper {
    position: relative;
    overflow: hidden;
}
.md-wrapper.is-collapsed {
    max-height: 280px;
}
.ops { display: flex; justify-content: flex-end; }
</style>
