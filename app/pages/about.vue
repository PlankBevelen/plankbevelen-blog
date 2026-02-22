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
                        <h1 class="title">{{ $t('pages.about.title') }}</h1>
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
import http from '~/utils/http'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { useAdminStore } from '@/stores/admin.store'

const { t, locale, setLocale } = useI18n() 

const { data, pending } = await useAsyncData('about-home-data', async () => {
    const res = await http.get('/api/home.data') as any
    if (res.status === 200) {
        return res.data
    }
    return null
})

const stats = computed(() => data.value?.stats || null)
const admin = useAdminStore()
const currentTheme = computed(() => admin.getTheme)

const mdPath = computed(() => locale.value === 'en' ? '/md/about-en.md' : '/md/about.md')
const { data: aboutData } = await useAsyncData('about-md', async () => {
    return await $fetch(mdPath.value, { responseType: 'text' })
}, { watch: [mdPath] })
const aboutMd = computed(() => aboutData.value || '')

useHead({
  title: t('pages.about.title'),
  meta: [
    { name: 'description', content: t('pages.about.meta.description') },
    { name: 'keywords', content: t('pages.about.meta.keywords') }
  ]
})
</script>

<style lang="less" scoped>
.about {
    min-height: 100vh;
    padding-top: @header-height;
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
    .container { padding: 40px 0; }
}


</style>
