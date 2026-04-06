<template>
    <Card class="article-desc" tag="article">
        <h2 class="title-wrapper">
            <NuxtLink :to="localePath('/article/' + article.id)" class="title">{{ article.title }}</NuxtLink>
        </h2>
        <div class="meta">
            <span class="category">{{ article.category }}</span>
            <span class="dot">·</span>
            <span class="flex gap-1 items-center"><nuxt-icon name="article/create-time" /> {{ formatDateTime(article.createTime) }}</span>
            <span class="flex gap-1 items-center"><nuxt-icon name="article/update-time" /> {{ formatDateTime(article.updateTime) }}</span>
            <div class="flex gap-1 items-center">
              <nuxt-icon name="article/tag" />
              <span v-for="tag in article.tags" :key="tag">{{ tag }}</span>
            </div>
        </div>
        <div class="content">
            <div class="md-wrapper" :class="{ 'is-collapsed': !isExpand }">
                <MdPreviewAsync :modelValue="displayContent" :theme="currentTheme" :noMermaid="true" :noKatex="true" previewOnly/>
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
import { ref, computed, defineAsyncComponent } from 'vue'
const localePath = useLocalePath()
const MdPreviewAsync = defineAsyncComponent({
    loader: () => import('md-editor-v3').then(m => m.MdPreview),
    delay: 100
})
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
const lines = computed(() => props.article.content.split('\n'))
const displayContent = computed(() => {
    if (isExpand.value) {
        return lines.value.slice(0, maxLines.value).join('\n')
    }
    return lines.value.slice(0, atLeastLines.value).join('\n')
})

</script>

<style scoped lang="less">
.article-desc {
    line-height: normal;
    height: auto;
    .title-wrapper {
        margin: 0;
        margin-bottom: 12px;
        line-height: normal;
    }
    .title {
        font-size: @font-size-xxl;
        font-weight: 500;
        color: var(--primary-color);
        cursor: pointer;
        text-decoration: none;
        line-height: normal;
        display: block;
        &:hover { color: var(--primary-hover-color); }
    }
    .meta {
      color: var(--tertiary-color);
      font-size: @font-size-xs;
      display: flex;
      gap: 8px;
      text-wrap: auto;
      /* .tags {
          display: flex;
          gap: 4px;
          font-size: @font-size-xs;
      } */
    }    
    .content {
        display: flex;
        flex-direction: column;
        gap: 8px;
        :deep(.md-editor-preview) {
            font-size: @font-size-sm !important;
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
