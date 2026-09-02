import { computed } from 'vue'
import type { SiteTimelineItem } from '@/types/site'
import { resolveLocalizedText } from '@/utils/localized-text'
import { useSiteContent } from '@/composables/useSiteContent'

export type GrowthTimelineItem = {
  year: string
  title: string
  desc: string
}

const FALLBACK_TIMELINE: SiteTimelineItem[] = [
  {
    id: 'frontend-foundation',
    year: '2022',
    title: {
      zh: '前端入门',
      en: 'Frontend Foundation'
    },
    desc: {
      zh: '系统学习 HTML、CSS、JavaScript 和 Vue，完成第一个可交付项目。',
      en: 'Learned HTML, CSS, JavaScript, and Vue, then shipped the first small production project.'
    },
    sort: 1
  },
  {
    id: 'full-stack-practice',
    year: '2023',
    title: {
      zh: '全栈实践',
      en: 'Full-Stack Practice'
    },
    desc: {
      zh: '开始深入 Node.js 和 API 设计，尝试独立完成前后端闭环。',
      en: 'Went deeper into Node.js and API design, building end-to-end features independently.'
    },
    sort: 2
  },
  {
    id: 'engineering-upgrade',
    year: '2024',
    title: {
      zh: '工程化升级',
      en: 'Engineering Upgrade'
    },
    desc: {
      zh: '把重心放在性能、组件架构和可维护性上，让项目更适合长期迭代。',
      en: 'Focused on performance, component architecture, and long-term maintainability.'
    },
    sort: 3
  },
  {
    id: 'ai-product-exploration',
    year: '2025 - Present',
    title: {
      zh: 'AI 与产品探索',
      en: 'AI + Product Exploration'
    },
    desc: {
      zh: '围绕 AI Agent 与内容平台持续试验，希望提升协作体验与整体效率。',
      en: 'Iterating on AI agent and content platform ideas to improve collaboration and UX.'
    },
    sort: 4
  }
]

export function useGrowthTimeline() {
  const { locale } = useI18n()
  const { data: siteContent } = useSiteContent()

  const growthTimeline = computed<GrowthTimelineItem[]>(() => {
    const source = [...(siteContent.value?.timeline?.length ? siteContent.value.timeline : FALLBACK_TIMELINE)]

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
