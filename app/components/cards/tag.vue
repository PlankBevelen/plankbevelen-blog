<template>
    <Card type="tag">
        <template #header>
            {{ $t('cards.tag.title') }}
        </template>
        <div class="cloud">
            <span v-for="w in cloudItems" :key="w.name" class="word" :style="{ fontSize: w.size + 'px', opacity: w.opacity, transform: 'rotate(' + w.rotate + 'deg)', color: w.color }">{{ w.name }}</span>
        </div>
    </Card>
</template>

<script setup lang="ts"> 
import type { Tag } from '@/types/tag'
import tagService from '~/services/tag.service'
import Card from './card.vue'
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
    tags: {
        type: Array as () => Tag[],
        default: () => []
    }
})

const tagList = ref<Tag[]>([])
const words = computed(() => {
    if (props.tags && props.tags.length > 0) return Array.from(new Set(props.tags.map((t: any) => String((t as any).name || t).trim()).filter(Boolean)))
    return Array.from(new Set(tagList.value.map((t) => String(t.name).trim()).filter(Boolean)))
})

function hash(s: string) {
    let h = 0
    for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0
    return Math.abs(h)
}

import { useAdminStore } from '@/stores/admin.store'
const admin = useAdminStore()
function palette() {
    if(admin.getTheme === 'light') {
        if (typeof window === 'undefined') return ['#409EFF', '#606266', '#67C23A']
        const style = getComputedStyle(document.documentElement)
        const base = style.getPropertyValue('--primary-color').trim() || '#409EFF'
        const sec = style.getPropertyValue('--secondary-color').trim() || '#606266'
        const act = style.getPropertyValue('--active-color').trim() || '#67C23A'
        return [base, sec, act]
    } else {
        return ['#409EFF', '#606266', '#67C23A']
    }
}
const cloudItems = computed(() => {
    const colors = palette()
    return words.value.map((name) => {
        const h = hash(name)
        const size = 12 + (h % 18)
        const rotate = ((h >> 5) % 9) - 4
        const color = colors[h % colors.length]
        const opacity = 0.9
        return { name, size, rotate, color, opacity }
    })
})

onMounted(async () => {
    if(!props.tags || props.tags.length === 0) {        
        try {
            const res = await tagService.getTags()
            if(res.status === 200 && res.data.status === 200) {
                tagList.value = res.data.data
            }
        } catch (error) {            
            console.log(error)
        }
    }
})
</script>

<style scoped lang="less">
.cloud { display: flex; flex-wrap: wrap; gap: 8px; height: 160px; }
.word { line-height: 1; }
</style>
