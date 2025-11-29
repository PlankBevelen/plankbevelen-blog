<template>
    <Card type="category">
        <template #header>
            分类
        </template>
        <ul class="categoryList">
            <li v-for="item in categoryList" :key="item.id" class="category-item">
                <span class="name">{{ item.name }}</span>
                <span class="count">{{ item.count }}</span>
            </li>
        </ul>
    </Card>
</template>

<script setup lang="ts"> 
import type { Category } from '@/types/category'
import categoryService from '~/services/category.service'
import Card from './card.vue'
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
    categories: {
        type: Array as () => Category[],
        default: () => []
    }
})

const fallback = ref<Category[]>([])
const categoryList = computed(() => {
    if (props.categories && props.categories.length > 0) return props.categories
    return fallback.value
})

onMounted(async () => {
    if (!props.categories || props.categories.length === 0) {
        try {
            const res = await categoryService.getCategories()
            if (res.status === 200 && res.data.status === 200) {
                fallback.value = res.data.data || []
            }
        } catch (e) {
        }
    }
})

</script>

<style scoped lang="less">
.categoryList {
    display: flex;
    flex-direction: column;
    gap: @base-gap;
    .category-item {
        display: flex;
        align-items: center;
        justify-content: space-between;            
        text-decoration: none;
        border-radius: @small-border-radius;
        padding: 6px 8px;
        .name {
            font-size: 14px;
        }
        .count {
            color: var(--tertiary-color);
            background-color: var(--mute-bg-color);
            padding: 4px 8px;
            border-radius: @small-border-radius;
            font-size: 11px;
        }
    }
}
</style>
