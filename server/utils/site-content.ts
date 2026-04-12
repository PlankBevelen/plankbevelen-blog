import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { Db } from 'mongodb'
import { getCollections, getDb } from './mongo'

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

export type SiteContentData = {
  about: {
    zh: string
    en: string
  }
  projects: SiteProjectItem[]
}

const SITE_CONTENT_DOC_ID = 'site-content'

const ABOUT_ZH_FALLBACK = `# 关于我

这里是关于页的默认内容，你现在可以直接在后台进行维护。

## 我在做什么

- 持续更新博客内容
- 记录前端、设计与产品实践
- 把个人项目做成可展示、可复盘的作品

## 我希望这里是什么

这不是单纯的文章仓库，而是一份持续迭代的个人数字工作台。
`

const ABOUT_EN_FALLBACK = `# About Me

This is the default about page content. You can now manage it directly from the admin panel.

## What I am building

- A blog that keeps growing
- A place to document frontend, design, and product work
- A portfolio of projects that can actually be reviewed later

## What this site should become

More than a content archive, it should feel like a living personal studio on the web.
`

const DEFAULT_PROJECTS: SiteProjectItem[] = [
  {
    id: 'plankbevelen-blog',
    title: 'PlankBevelen Blog',
    summary: '一个把博客、作品集和后台管理整合在一起的个人站点。',
    description:
      '这个项目的目标不是只写文章，而是把内容管理、个人展示和访问数据沉淀放进同一套系统里，让站点本身也成为长期作品。',
    period: '2025 - 至今',
    status: '持续迭代',
    accentColor: '#0f766e',
    tags: ['Nuxt', 'MongoDB', 'Element Plus', 'SSR'],
    highlights: [
      '支持文章、分类和标签的后台管理',
      '关于页与项目页改为后台可维护内容',
      '访问日志从服务端自动采集并可在后台查看'
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
    summary: '一个偏视觉实验方向的前端动效作品集合。',
    description:
      '我把页面转场、滚动叙事和局部交互动画集中到同一个展示项目里，用来沉淀更完整的动效表达方式。',
    period: '2024 - 2025',
    status: '概念验证',
    accentColor: '#b45309',
    tags: ['GSAP', 'Three.js', 'Interaction'],
    highlights: [
      '尝试将内容页做成更有节奏感的观看体验',
      '沉淀可复用的动画片段与版式模式',
      '兼顾移动端和桌面端的动效表现'
    ],
    links: {
      repoUrl: '',
      demoUrl: ''
    },
    sort: 2
  },
  {
    id: 'notes-lab',
    title: 'Notes Lab',
    summary: '一个用于整理灵感、草稿和技术卡片的轻量知识实验室。',
    description:
      '这类项目更像内部工作台，重点不是对外展示，而是把碎片笔记、路线草稿和可实践的方案整理成真正可回看的资料。',
    period: '2024 - 至今',
    status: '内部使用',
    accentColor: '#1d4ed8',
    tags: ['Content', 'Knowledge Base', 'Workflow'],
    highlights: [
      '围绕“轻量记录 + 快速回看”设计内容结构',
      '更关注积累和检索，而不是复杂的功能堆叠',
      '适合作为博客内容的前置草稿池'
    ],
    links: {
      repoUrl: '',
      demoUrl: ''
    },
    sort: 3
  }
]

async function readMarkdownFile(filename: string, fallback: string) {
  try {
    return await readFile(join(process.cwd(), 'public', 'md', filename), 'utf8')
  } catch {
    return fallback
  }
}

async function buildDefaultSiteContent(): Promise<SiteContentData> {
  const [zh, en] = await Promise.all([
    readMarkdownFile('about.md', ABOUT_ZH_FALLBACK),
    readMarkdownFile('about-en.md', ABOUT_EN_FALLBACK)
  ])

  return {
    about: {
      zh,
      en
    },
    projects: DEFAULT_PROJECTS
  }
}

function cleanString(value: unknown) {
  return String(value || '').trim()
}

function createProjectId(index: number) {
  return `project-${Date.now()}-${index + 1}`
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
    status: cleanString(project?.status) || '规划中',
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

export function normalizeSiteContentInput(input: any): SiteContentData {
  const projects = Array.isArray(input?.projects)
    ? input.projects.map((item: any, index: number) => normalizeProject(item, index))
    : []

  return {
    about: {
      zh: String(input?.about?.zh || ''),
      en: String(input?.about?.en || '')
    },
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
