<template>
  <div class="about">
    <div class="container">
      <LayoutThreeColumn :loading="pending || contentPending">
        <template #left>
          <WidgetBlogger
            :articleCount="stats?.articles || 0"
            :categoryCount="stats?.categories || 0"
            :tagCount="stats?.tags || 0"
          />
          <WidgetRecordLink />
        </template>

        <template #middle>
          <BaseCard class="about-content">
            <h1 class="title">{{ $t('pages.about.title') }}</h1>
            <MdPreview v-if="aboutMd" :modelValue="aboutMd" :theme="currentTheme" />
            <el-empty v-else description="暂时还没有关于页内容" />
          </BaseCard>
        </template>

        <template #right>
          <WidgetCategory :categories="data?.categories" />
          <WidgetTag :tags="data?.tags" />
        </template>
      </LayoutThreeColumn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData } from 'nuxt/app'
import { useSidebarData } from '@/composables/useSidebarData'
import siteService from '@/services/site.service'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { useAdminStore } from '@/stores/admin.store'

const { t, locale } = useI18n()

const { data, pending } = await useSidebarData()
const stats = computed(() => data.value?.stats || null)
const admin = useAdminStore()
const currentTheme = computed(() => admin.getTheme)

const { data: contentData, pending: contentPending } = await useAsyncData('site-content-public', async () => {
  const res: any = await siteService.getContent()
  return (
    res?.data || {
      about: { zh: '', en: '' },
      projects: []
    }
  )
})

const aboutMd = computed(() => {
  const about = contentData.value?.about
  if (!about) return ''
  return locale.value === 'en' ? about.en || about.zh || '' : about.zh || about.en || ''
})

usePageSeo({
  title: t('pages.about.title'),
  description: t('pages.about.meta.description')
})
</script>

<style lang="less" scoped>
.about {
  min-height: 100vh;
  padding-top: @header-height;

  .container {
    padding-top: 40px;
    padding-bottom: 40px;
  }
}

.about-content {
  overflow: hidden;
}

.about-hero {
  margin-bottom: 28px;
  padding: 28px;
  border-radius: 24px;
  background:
    radial-gradient(circle at top right, rgba(15, 118, 110, 0.16), transparent 30%),
    linear-gradient(135deg, color-mix(in srgb, var(--card-color) 82%, #f3fbf9), var(--card-color));
  border: 1px solid rgba(15, 118, 110, 0.14);
}

.about-kicker {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--primary-color);
}

.title {
  margin: 0;
  font-size: @font-size-xxl;
  font-weight: 600;
  color: var(--text-color);
  line-height: 1.2;
}

.about-desc {
  margin: 14px 0 0;
  font-size: 14px;
  line-height: 1.8;
  color: var(--secondary-color);
}
</style>
