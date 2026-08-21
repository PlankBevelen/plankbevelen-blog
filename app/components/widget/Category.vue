<!-- 分类卡片 -->
<template>
  <BaseCard type="category">
    <template #header>
      {{ $t('category.title') }}
    </template>
    <ul class="categoryList">
      <li v-for="item in categoryList" :key="item.id" class="category-item" @click="onSelect(item)">
          <span class="name">{{ item.name }}</span>
          <span class="count">{{ item.count }}</span>       
      </li>
    </ul>
  </BaseCard>
</template>

<script setup lang="ts"> 
import type { Category } from '@/types/category'
import categoryService from '~/services/category.service'
import { ref, computed, onMounted } from 'vue'

const emit = defineEmits(['select'])

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
            const res: any = await categoryService.getCategories()
            if (res.status === 200) {
                fallback.value = res.data || []
            }
        } catch (e) {
        }
    }
})

function onSelect(item: Category) {
    emit('select', item)
}

</script>

<style scoped lang="less">
.categoryList {
    display: flex;
    flex-direction: column;
    gap: @space-base;
    .category-item {
        display: flex;
        align-items: center;
        justify-content: space-between;            
        text-decoration: none;
        border-radius: @small-border-radius;
        padding: @space-xs @space-base;
        cursor: pointer;
        &:hover { background-color: var(--shallow-hover-bg-color); }
        .name {
            font-size: @font-size-sm;
        }
        .count {
            color: var(--tertiary-color);
            background-color: var(--mute-bg-color);
            padding: @space-2xs @space-base;
            border-radius: @small-border-radius;
            font-size: @font-size-2xs;
        }
    }
}
</style>
