<template>
  <div class="timeline-page">
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
          <WidgetPageIntro :title="pageTitle" :content="timelineIntro" />
          <WidgetTimeline :timeline="growthTimeline" />
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
import { useSidebarData } from '@/composables/useSidebarData'
import { useGrowthTimeline } from '@/composables/useGrowthTimeline'
import { useSiteContent } from '@/composables/useSiteContent'
import { resolveLocalizedText } from '@/utils/localized-text'

const { locale } = useI18n()
const { data, pending } = await useSidebarData()
const stats = computed(() => data.value?.stats || null)
const { growthTimeline } = useGrowthTimeline()
const { data: contentData, pending: contentPending } = await useSiteContent()

const pageTitle = computed(() => (locale.value === 'en' ? 'Timeline' : '时间线'))
const timelineIntro = computed(() => resolveLocalizedText(contentData.value?.pages?.timeline, locale.value))

usePageSeo({
  title: () => (locale.value === 'en' ? 'Timeline' : '时间线'),
  description: () =>
    locale.value === 'en'
      ? 'A chronological record of milestones and growth notes.'
      : '按时间顺序记录成长节点与阶段性思考。'
})
</script>

<style scoped lang="less">
.timeline-page {
  min-height: 100vh;
  padding-top: @header-height;

  .container {
    padding-top: 40px;
    padding-bottom: 40px;
  }
}
</style>
