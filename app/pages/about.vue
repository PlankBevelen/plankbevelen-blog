<template>
    <div class="about">
        <div class="container">
            <LayoutThreeColumn :loading="pending">
                <template #left>
                    <WidgetBlogger :articleCount="stats?.articles || 0" :categoryCount="stats?.categories || 0" :tagCount="stats?.tags || 0" />
                    <WidgetRecordLink />
                </template>
                <template #middle>                    
                    <BaseCard class="aboutContent">
                        <h1 class="title">{{ $t('pages.about.title') }}</h1>
                        <MdPreview v-if="aboutMd" :modelValue="aboutMd" :theme="currentTheme" />
                    </BaseCard>
                </template>
                <template #right>
                    <WidgetCategory />
                    <WidgetTag />
                </template>
            </LayoutThreeColumn>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData, useHead } from 'nuxt/app'






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

// SEO：canonical 由 app.vue 统一处理，这里只补充页面自己的 title 和 description
usePageSeo({
  title: t('pages.about.title'),
  description: t('pages.about.meta.description'),
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
    .container { 
        padding-top: 40px; 
        padding-bottom: 40px; 
    }
}


</style>
