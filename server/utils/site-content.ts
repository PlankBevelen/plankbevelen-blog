import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { Db } from 'mongodb'
import { getCollections, getDb } from './mongo'

export type SiteLocalizedText = {
  zh: string
  en: string
}

export type SiteProjectLink = {
  repoUrl: string
  demoUrl: string
}

export type SiteProjectItem = {
  id: string
  title: string
  summary: string
  description: string
  period: string
  status: string
  accentColor: string
  tags: string[]
  highlights: string[]
  links: SiteProjectLink
  sort: number
}

export type SiteTimelineItem = {
  id: string
  year: string
  title: SiteLocalizedText
  desc: SiteLocalizedText
  sort: number
}

export type SitePageContent = {
  about: SiteLocalizedText
  timeline: SiteLocalizedText
  project: SiteLocalizedText
}

export type SiteContentData = {
  about: SiteLocalizedText
  pages: SitePageContent
  timeline: SiteTimelineItem[]
  projects: SiteProjectItem[]
}

const SITE_CONTENT_DOC_ID = 'site-content'

const DEFAULT_PAGE_CONTENT: SitePageContent = {
  about: {
    zh: '这里可以放一段关于页导语，帮助读者快速理解这个页面的主题。',
    en: 'Use this area for a short about-page intro that helps readers understand the page at a glance.'
  },
  timeline: {
    zh: '时间线会展示我的关键节点和阶段性成长，便于按时间顺序回顾。',
    en: 'The timeline highlights milestones and growth moments in chronological order.'
  },
  project: {
    zh: '项目页会持续更新，记录正在做、已经完成和仍值得打磨的内容。',
    en: 'The projects page keeps evolving with work in progress, shipped work, and ideas worth polishing.'
  }
}

const DEFAULT_TIMELINE: SiteTimelineItem[] = [
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

const DEFAULT_PROJECTS: SiteProjectItem[] = [
  {
    id: 'plankbevelen',
    title: 'plankbevelen',
    summary: '个人博客和内容管理平台',
    description: '基于 Nuxt、MongoDB 和 Element Plus 的个人博客与内容管理站点。',
    period: '2025 - Present',
    status: 'In progress',
    accentColor: '#0f766e',
    tags: ['Nuxt', 'MongoDB', 'Element Plus', 'SSR'],
    highlights: [
      '支持后台内容管理',
      '前后端数据统一存储',
      '适合持续迭代的个人站点结构'
    ],
    links: {
      repoUrl: '',
      demoUrl: ''
    },
    sort: 1
  },
  {
    id: 'motion-showcase',
    title: 'Motion Showcase',
    summary: '动画和交互实验集合',
    description: '用于整理动画实验、交互组件和视觉探索的小型作品集。',
    period: '2024 - 2025',
    status: 'Archived',
    accentColor: '#b45309',
    tags: ['GSAP', 'Three.js', 'Interaction'],
    highlights: [
      '适合展示动效能力',
      '为复杂交互提供实验场',
      '可以持续补充新的案例'
    ],
    links: {
      repoUrl: '',
      demoUrl: ''
    },
    sort: 2
  },
]

const DEFAULT_SITE_CONTENT: SiteContentData = {
  about: {
    zh: '# 关于我\n\n这里是默认的关于页内容。你可以直接在后台编辑它。',
    en: '# About Me\n\nThis is the default about page content. You can edit it directly from the admin panel.'
  },
  pages: DEFAULT_PAGE_CONTENT,
  timeline: DEFAULT_TIMELINE,
  projects: DEFAULT_PROJECTS
}

async function readMarkdownFile(filename: string, fallback: string) {
  try {
    return await readFile(join(process.cwd(), 'public', 'md', filename), 'utf8')
  } catch {
    return fallback
  }
}

async function buildDefaultSiteContent(): Promise<SiteContentData> {
  const [zh, en] = await Promise.all([
    readMarkdownFile('about.md', DEFAULT_SITE_CONTENT.about.zh),
    readMarkdownFile('about-en.md', DEFAULT_SITE_CONTENT.about.en)
  ])

  return {
    ...DEFAULT_SITE_CONTENT,
    about: {
      zh,
      en
    }
  }
}

function cleanString(value: unknown) {
  return String(value || '').trim()
}

function createProjectId(index: number) {
  return `project-${Date.now()}-${index + 1}`
}

function createTimelineId(index: number) {
  return `timeline-${Date.now()}-${index + 1}`
}

function normalizeLocalizedText(value: any, fallback: SiteLocalizedText): SiteLocalizedText {
  return {
    zh: cleanString(value?.zh) || fallback.zh,
    en: cleanString(value?.en) || fallback.en
  }
}

function normalizeProject(project: any, index: number): SiteProjectItem {
  const tags = Array.isArray(project?.tags)
    ? project.tags.map((item: unknown) => cleanString(item)).filter(Boolean)
    : []
  const highlights = Array.isArray(project?.highlights)
    ? project.highlights.map((item: unknown) => cleanString(item)).filter(Boolean)
    : []

  return {
    id: cleanString(project?.id) || createProjectId(index),
    title: cleanString(project?.title),
    summary: cleanString(project?.summary),
    description: cleanString(project?.description),
    period: cleanString(project?.period),
    status: cleanString(project?.status) || 'In progress',
    accentColor: cleanString(project?.accentColor) || '#0f766e',
    tags,
    highlights,
    links: {
      repoUrl: cleanString(project?.links?.repoUrl),
      demoUrl: cleanString(project?.links?.demoUrl)
    },
    sort: Number(project?.sort) > 0 ? Number(project.sort) : index + 1
  }
}

function normalizeTimelineItem(item: any, index: number): SiteTimelineItem {
  return {
    id: cleanString(item?.id) || createTimelineId(index),
    year: cleanString(item?.year),
    title: normalizeLocalizedText(item?.title, {
      zh: DEFAULT_TIMELINE[index]?.title.zh || '',
      en: DEFAULT_TIMELINE[index]?.title.en || ''
    }),
    desc: normalizeLocalizedText(item?.desc, {
      zh: DEFAULT_TIMELINE[index]?.desc.zh || '',
      en: DEFAULT_TIMELINE[index]?.desc.en || ''
    }),
    sort: Number(item?.sort) > 0 ? Number(item.sort) : index + 1
  }
}

export function normalizeSiteContentInput(input: any): SiteContentData {
  const projects = Array.isArray(input?.projects)
    ? input.projects.map((item: any, index: number) => normalizeProject(item, index))
    : []
  const timeline = Array.isArray(input?.timeline)
    ? input.timeline.map((item: any, index: number) => normalizeTimelineItem(item, index))
    : []

  return {
    about: normalizeLocalizedText(input?.about, DEFAULT_SITE_CONTENT.about),
    pages: {
      about: normalizeLocalizedText(input?.pages?.about, DEFAULT_PAGE_CONTENT.about),
      timeline: normalizeLocalizedText(input?.pages?.timeline, DEFAULT_PAGE_CONTENT.timeline),
      project: normalizeLocalizedText(input?.pages?.project, DEFAULT_PAGE_CONTENT.project)
    },
    timeline: timeline
      .sort((a, b) => a.sort - b.sort)
      .map((item, index) => ({ ...item, sort: index + 1 })),
    projects: projects
      .sort((a, b) => a.sort - b.sort)
      .map((project, index) => ({ ...project, sort: index + 1 }))
  }
}

export async function getSiteContent(dbInstance?: Db) {
  const db = dbInstance || getDb()
  const { siteConfigs } = getCollections(db)

  let doc = await siteConfigs.findOne({ _id: SITE_CONTENT_DOC_ID })
  if (!doc) {
    const now = new Date()
    const data = await buildDefaultSiteContent()
    await siteConfigs.updateOne(
      { _id: SITE_CONTENT_DOC_ID },
      {
        $setOnInsert: {
          _id: SITE_CONTENT_DOC_ID,
          type: 'site-content',
          data,
          createdAt: now,
          updatedAt: now
        }
      },
      { upsert: true }
    )
    doc = await siteConfigs.findOne({ _id: SITE_CONTENT_DOC_ID })
  }

  return {
    ...doc,
    data: normalizeSiteContentInput(doc?.data || {})
  }
}

export async function updateSiteContent(input: any, dbInstance?: Db) {
  const db = dbInstance || getDb()
  const { siteConfigs } = getCollections(db)
  const now = new Date()
  const data = normalizeSiteContentInput(input)

  await siteConfigs.updateOne(
    { _id: SITE_CONTENT_DOC_ID },
    {
      $set: {
        type: 'site-content',
        data,
        updatedAt: now
      },
      $setOnInsert: {
        createdAt: now
      }
    },
    { upsert: true }
  )

  return await getSiteContent(db)
}
