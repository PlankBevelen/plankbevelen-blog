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
import { SITE_URL } from '@/composables/useSeo'

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

// 结构化数据：ItemList（时间线）
useHead(() => ({
  script: [
    {
      key: 'timeline-ld',
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: growthTimeline.value.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.title,
          description: item.desc,
          url: `${SITE_URL}/timeline`,
        })),
      }),
    },
  ],
}))
</script>

<style scoped lang="less">
.timeline-page {
  min-height: 100vh;
  padding-top: @header-height;

  .container {
    padding-top: @space-5xl;
    padding-bottom: @space-5xl;
  }
}
</style>
