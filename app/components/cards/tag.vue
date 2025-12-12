<template>
    <Card type="tag" class="tag-cloud-card">
        <template #header>
            <div class="header-content">
                <i class="el-icon-collection-tag"></i>
                {{ $t('cards.tag.title') }}
            </div>
        </template>
        <div class="cloud-container">
            <div class="cloud-wrapper">
                <span 
                    v-for="w in cloudItems" 
                    :key="w.name" 
                    class="cloud-word" 
                    :style="{ 
                        fontSize: w.size + 'px', 
                        color: w.color,
                        transform: `rotate(${w.rotate}deg)`,
                        opacity: w.opacity
                    }"
                >
                    {{ w.name }}
                </span>
            </div>
        </div>
    </Card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Tag } from '@/types/tag'
import tagService from '~/services/tag.service'
import Card from './card.vue'
import { useAdminStore } from '@/stores/admin.store'

const props = defineProps({
    tags: {
        type: Array as () => Tag[],
        default: () => []
    }
})

const tagList = ref<Tag[]>([])
const admin = useAdminStore()

const rawTags = computed(() => {
    return props.tags.length > 0 ? props.tags : tagList.value
})

const getThemeColors = () => {
    const isLight = admin.getTheme === 'light'
    // 提供更丰富的配色方案
    return isLight 
        ? ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#722ed1', '#13c2c2']
        : ['#58a6ff', '#7ee787', '#d29922', '#f78166', '#8b949e', '#bc8cff', '#39c5bb']
}

function hash(s: string) {
    let h = 0
    for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0
    return Math.abs(h)
}

const cloudItems = computed(() => {
    const colors = getThemeColors()
    
    return rawTags.value.map((t: any) => {
        const name = typeof t === 'string' ? t : (t.name || '')
        const count = t.count || 1 
        const h = hash(name)
        
        const baseSize = 14
        const weightBonus = Math.min(count * 2, 12) 
        const randomBonus = h % 6
        
        return {
            name,
            size: baseSize + weightBonus + randomBonus,
            rotate: (h % 3) * 11 - 11, 
            color: colors[h % colors.length],
            opacity: 0.8 + (h % 3) * 0.1
        }
    })
})

onMounted(async () => {
    if (props.tags.length === 0) {
        try {
            const res = await tagService.getTags()
            if (res.data?.data) tagList.value = res.data.data
        } catch (e) {
            console.error('Fetch tags failed:', e)
        }
    }
})
</script>

<style scoped lang="less">

.cloud-container {
    height: auto; 
    overflow: hidden;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}

.cloud-wrapper {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 10px 16px; /* 适当的间距 */
    padding: 10px;
}

.cloud-word {
    display: inline-block;
    white-space: nowrap;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    font-weight: 500;
    user-select: none;

    &:hover {
        transform: scale(1.2) rotate(0deg) !important;
        opacity: 1 !important;
        text-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10;
    }
}

.header-content {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: bold;
}
</style>