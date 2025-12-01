<template>
    <div class="about">
        <div class="container">
            <ThreeColumnLayout :loading="pending">
                <template #left>
                    <BloggerCard :articleCount="stats?.articles || 0" :categoryCount="stats?.categories || 0" :tagCount="stats?.tags || 0" />
                    <RecordLinkCard />
                </template>
                <template #middle>
                    <Card class="aboutContent">
                        <MdPreview v-if="aboutMd" :modelValue="aboutMd" :theme="currentTheme" />
                    </Card>
                </template>
                <template #right>
                    <CategoryCard />
                    <TagCard />
                </template>
            </ThreeColumnLayout>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData, useHead } from 'nuxt/app'
import ThreeColumnLayout from '@/components/layouts/ThreeColumnLayout.vue'
import BloggerCard from '@/components/cards/blogger.vue'
import RecordLinkCard from '@/components/cards/recordLink.vue'
import CategoryCard from '@/components/cards/category.vue'
import TagCard from '@/components/cards/tag.vue'
import Card from '@/components/cards/card.vue'
import http from '~/utils/http-common'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { useAdminStore } from '@/stores/admin.store'

const { data, pending } = await useAsyncData('about-home-data', async () => {
    const res = await http.get('/api/home.data') as any
    if (res.status === 200 && res.data.status === 200) {
        return res.data.data
    }
    return null
})

const stats = computed(() => data.value?.stats || null)
const admin = useAdminStore()
const currentTheme = computed(() => admin.getTheme)

const { data: aboutData } = await useAsyncData('about-md', async () => {
    return await $fetch('/md/about.md', { responseType: 'text' })
})
const aboutMd = computed(() => aboutData.value || '')

useHead({
    title: '关于我',
    meta: [
        { name: 'description', content: '关于本站与作者的介绍' }
    ]
})
</script>

<style lang="less" scoped>
.about {
    min-height: 100vh;
    padding-top: @header-height;
    .container { padding: 40px 0; }
}


</style>
