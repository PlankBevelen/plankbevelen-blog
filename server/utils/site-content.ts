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

const EMPTY_LOCALIZED_TEXT: SiteLocalizedText = { zh: '', en: '' }

const DEFAULT_SITE_CONTENT: SiteContentData = {
  about: {
    zh: '# 关于我\n\n这里是默认的关于页内容。你可以直接在后台编辑它。',
    en: '# About Me\n\nThis is the default about page content. You can edit it directly from the admin panel.'
  },
  pages: DEFAULT_PAGE_CONTENT,
  timeline: [],
  projects: []
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
    title: normalizeLocalizedText(item?.title, EMPTY_LOCALIZED_TEXT),
    desc: normalizeLocalizedText(item?.desc, EMPTY_LOCALIZED_TEXT),
    sort: Number(item?.sort) > 0 ? Number(item.sort) : index + 1
  }
}

export function normalizeSiteContentInput(input: any): SiteContentData {
  const projects: SiteProjectItem[] = Array.isArray(input?.projects)
    ? input.projects.map((item: any, index: number) => normalizeProject(item, index))
    : []
  const timeline: SiteTimelineItem[] = Array.isArray(input?.timeline)
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
