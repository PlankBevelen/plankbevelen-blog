export type SiteProject = {
  id: string
  title: string
  summary: string
  description: string
  period: string
  status: string
  accentColor: string
  tags: string[]
  highlights: string[]
  links: {
    repoUrl: string
    demoUrl: string
  }
  sort: number
}

export type SiteLocalizedText = {
  zh: string
  en: string
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
  project?: SiteLocalizedText
}

export type SiteContent = {
  about: SiteLocalizedText
  pages: SitePageContent
  timeline: SiteTimelineItem[]
  projects: SiteProject[]
  updatedAt?: string | null
}

export type VisitLogSummary = {
  totalVisits: number
  uniqueVisitors: number
  averageDurationMs: number
  todayVisits: number
  latestVisitedAt: string | null
  topPaths: Array<{ path: string; count: number }>
  deviceDistribution: Array<{ deviceType: string; count: number }>
}

export type VisitLogItem = {
  requestId: string
  path: string
  fullPath: string
  method: string
  statusCode: number
  ip: string
  userAgent: string
  referer: string
  acceptLanguage: string
  browser: string
  os: string
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'bot' | 'unknown'
  durationMs: number
  visitedAt: string
}

export type VisitLogResponse = {
  summary: VisitLogSummary
  list: VisitLogItem[]
  pagination: {
    page: number
    pageSize: number
    total: number
    days: number
  }
}
