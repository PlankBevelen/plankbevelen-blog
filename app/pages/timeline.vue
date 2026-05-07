<template>
  <div class="timeline-page">
    <div class="container">
      <LayoutThreeColumn :loading="pending">
        <template #left>
          <WidgetBlogger
            :articleCount="stats?.articles || 0"
            :categoryCount="stats?.categories || 0"
            :tagCount="stats?.tags || 0"
          />
          <WidgetRecordLink />
        </template>

        <template #middle>
          <WidgetAboutTimelineCard :timeline="growthTimeline" />
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

const { data, pending } = await useSidebarData()
const stats = computed(() => data.value?.stats || null)
const { growthTimeline } = useGrowthTimeline()

usePageSeo({
  title: '成长时间线',
  description: '记录 PlankBevelen 在技术学习与产品实践中的阶段成长。'
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
