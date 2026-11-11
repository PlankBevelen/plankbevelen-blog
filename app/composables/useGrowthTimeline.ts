import { computed } from 'vue'
import { resolveLocalizedText } from '@/utils/localized-text'
import { useSiteContent } from '@/composables/useSiteContent'

export type GrowthTimelineItem = {
  year: string
  title: string
  desc: string
}

export function useGrowthTimeline() {
  const { locale } = useI18n()
  const { data: siteContent } = useSiteContent()

  const growthTimeline = computed<GrowthTimelineItem[]>(() => {
    const source = [...(siteContent.value?.timeline || [])]

    return source
      .sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0))
      .map(item => ({
        year: item.year,
        title: resolveLocalizedText(item.title, locale.value),
        desc: resolveLocalizedText(item.desc, locale.value)
      }))
  })

  return {
    growthTimeline
  }
}
