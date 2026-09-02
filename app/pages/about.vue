<template>
  <div class="about">
    <div class="container">
      <LayoutTwoColumn :loading="pending || contentPending">
        <template #left>
          <WidgetBlogger
            :articleCount="stats?.articles || 0"
            :categoryCount="stats?.categories || 0"
            :tagCount="stats?.tags || 0"
          />
          <WidgetRecordLink />
        </template>

        <template #right>
          <WidgetPageIntro :title="$t('pages.about.title')" :content="aboutIntro" />
          <WidgetContact />
          <WidgetTimeline :timeline="growthTimeline" compact clickableCard />
        </template>
      </LayoutTwoColumn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSidebarData } from '@/composables/useSidebarData'
import { useGrowthTimeline } from '@/composables/useGrowthTimeline'
import { useSiteContent } from '@/composables/useSiteContent'
import { resolveLocalizedText } from '@/utils/localized-text'
import { SITE_URL, SITE_AUTHOR, SITE_IMAGE } from '@/composables/useSeo'

const { t, locale } = useI18n()

const { data, pending } = await useSidebarData()
const stats = computed(() => data.value?.stats || null)
const { growthTimeline } = useGrowthTimeline()
const { data: contentData, pending: contentPending } = await useSiteContent()


const aboutIntro = computed(() => {
  return resolveLocalizedText(contentData.value?.pages?.about, locale.value)
})

usePageSeo({
  title: t('pages.about.title'),
  description: t('pages.about.meta.description')
})

// 结构化数据：ProfilePage + Person
useHead(() => ({
  script: [
    {
      key: 'about-ld',
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        mainEntity: {
          '@type': 'Person',
          name: SITE_AUTHOR,
          url: SITE_URL,
          image: SITE_IMAGE,
          description: t('pages.about.meta.description'),
        },
      }),
    },
  ],
}))
</script>

<style lang="less" scoped>
.about {
  min-height: 100vh;
  padding-top: @header-height;

  .container {
    padding-top: @space-5xl;
    padding-bottom: @space-5xl;
  }
}
</style>
