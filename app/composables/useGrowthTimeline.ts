import { computed } from 'vue'

export type GrowthTimelineItem = {
  year: string
  title: string
  desc: string
}

const ZH_TIMELINE: GrowthTimelineItem[] = [
  {
    year: '2022',
    title: '前端启蒙',
    desc: '系统学习 HTML、CSS、JavaScript 与 Vue，开始搭建第一个可上线的小项目。'
  },
  {
    year: '2023',
    title: '全栈实践',
    desc: '深入 Node.js 与接口设计，尝试从前端到后端独立完成完整功能闭环。'
  },
  {
    year: '2024',
    title: '工程化升级',
    desc: '聚焦性能优化、组件抽象与可维护性，逐步形成稳定的项目开发范式。'
  },
  {
    year: '2025 - 至今',
    title: 'AI + 产品探索',
    desc: '围绕 AI Agent 与内容平台持续迭代，探索更高效的开发协作与交互体验。'
  }
]

const EN_TIMELINE: GrowthTimelineItem[] = [
  {
    year: '2022',
    title: 'Frontend Foundation',
    desc: 'Learned HTML, CSS, JavaScript, and Vue, then shipped the first small production project.'
  },
  {
    year: '2023',
    title: 'Full-Stack Practice',
    desc: 'Went deeper into Node.js and API design, building end-to-end features independently.'
  },
  {
    year: '2024',
    title: 'Engineering Upgrade',
    desc: 'Focused on performance, component architecture, and long-term maintainability.'
  },
  {
    year: '2025 - Present',
    title: 'AI + Product Exploration',
    desc: 'Iterating on AI agent and content platform ideas to improve collaboration and UX.'
  }
]

export function useGrowthTimeline() {
  const { locale } = useI18n()

  const growthTimeline = computed(() =>
    locale.value === 'en' ? EN_TIMELINE : ZH_TIMELINE
  )

  return {
    growthTimeline
  }
}
