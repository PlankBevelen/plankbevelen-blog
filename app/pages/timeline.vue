<template>
  <div class="timeline-page">
    <div class="container">
      <LayoutTwoColumn :loading="pending">
        <template #left>
          <WidgetBlogger
            :articleCount="stats?.articles || 0"
            :categoryCount="stats?.categories || 0"
            :tagCount="stats?.tags || 0"
          />
          <WidgetRecordLink />
        </template>

        <template #right>
          <WidgetTimeline :timeline="growthTimeline" />
        </template>
      </LayoutTwoColumn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSidebarData } from '@/composables/useSidebarData'
import { useGrowthTimeline } from '@/composables/useGrowthTimeline'

const { locale } = useI18n()
const { data, pending } = await useSidebarData()
const stats = computed(() => data.value?.stats || null)
const { growthTimeline } = useGrowthTimeline()

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
